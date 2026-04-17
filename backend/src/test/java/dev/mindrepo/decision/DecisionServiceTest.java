package dev.mindrepo.decision;
import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import dev.mindrepo.activity.ActivityRepository;
import dev.mindrepo.common.ResourceNotFoundException;
import dev.mindrepo.decision.dto.AddCommentRequest;
import dev.mindrepo.decision.dto.CreateDecisionRequest;
import dev.mindrepo.decision.dto.DecisionResponse;
import dev.mindrepo.decision.dto.UpdateDecisionRequest;
import dev.mindrepo.org.Org;
import dev.mindrepo.org.OrgMemberRepository;
import dev.mindrepo.repo.Repo;
import dev.mindrepo.repo.RepoRepository;
import dev.mindrepo.user.User;

@ExtendWith(MockitoExtension.class)
class DecisionServiceTest {

    @Mock private DecisionRepository decisionRepository;
    @Mock private RepoRepository repoRepository;
    @Mock private OrgMemberRepository orgMemberRepository;
    @Mock private ActivityRepository activityRepository;
    @Mock private DecisionVoteRepository voteRepository;
    @Mock private CommentRepository commentRepository;

    @InjectMocks
    private DecisionService decisionService;

    private User mockUser;
    private Repo mockRepo;
    private String currentUserId = "user-123";
    private OffsetDateTime now = OffsetDateTime.now();

    @BeforeEach
    void setUp() {
        mockUser = User.builder().id(currentUserId).name("Mohammed").build();
        Org mockOrg = Org.builder().id("org-1").build();
        mockRepo = Repo.builder().id("repo-1").fullName("mindrepo/core").org(mockOrg).build();
    }

    @Test
    @DisplayName("Should create decision successfully when user is org member")
    void createDecision_Success() {
        CreateDecisionRequest request = new CreateDecisionRequest(
                "New Feature", "Body content", "repo-1", DecisionStatus.PROPOSED, List.of("java")
        );

        // إضافة createdAt والبيانات اللازمة للـ Mapper
        Decision savedDecision = Decision.builder()
                .id("dec-1")
                .title("New Feature")
                .author(mockUser)
                .repo(mockRepo)
                .status(DecisionStatus.PROPOSED)
                .createdAt(now)
                .updatedAt(now)
                .tags(new String[]{"java"})
                .build();

        when(repoRepository.findById("repo-1")).thenReturn(Optional.of(mockRepo));
        when(orgMemberRepository.existsByOrgIdAndUserId("org-1", currentUserId)).thenReturn(true);
        when(decisionRepository.save(any(Decision.class))).thenReturn(savedDecision);
        when(voteRepository.sumVotesByDecisionId(any())).thenReturn(0);

        DecisionResponse response = decisionService.createDecision(request, currentUserId);

        assertThat(response).isNotNull();
        assertThat(response.title()).isEqualTo("New Feature");
        verify(activityRepository).save(any());
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when decision id doesn't exist")
    void getDecisionById_NotFound() {
        when(decisionRepository.findByIdWithAuthorRepoOrg("invalid-id")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            decisionService.getDecisionById("invalid-id", currentUserId);
        });
    }

    @Test
    @DisplayName("Should update decision correctly when user is the author")
    void updateDecision_Success() {
        Decision existingDecision = Decision.builder()
                .id("dec-1")
                .author(mockUser)
                .repo(mockRepo)
                .title("Old Title")
                .createdAt(now)
                .updatedAt(now)
                .tags(new String[]{})
                .status(DecisionStatus.PROPOSED)
                .build();

        UpdateDecisionRequest updateReq = new UpdateDecisionRequest("New Title", null, null, null);

        when(decisionRepository.findById("dec-1")).thenReturn(Optional.of(existingDecision));
        when(decisionRepository.save(any(Decision.class))).thenReturn(existingDecision);

        DecisionResponse response = decisionService.updateDecision("dec-1", updateReq, currentUserId);

        assertThat(response.title()).isEqualTo("New Title");
        verify(decisionRepository).save(any(Decision.class));
    }

    @Test
    @DisplayName("Should add comment successfully")
    void addComment_Success() {
        AddCommentRequest commentReq = new AddCommentRequest("Nice logic!", null);
        Decision decision = Decision.builder().id("dec-1").repo(mockRepo).build();
        
        Comment savedComment = Comment.builder()
                .id("comm-1")
                .body("Nice logic!")
                .author(mockUser)
                .createdAt(now)
                .updatedAt(now)
                .build();

        when(decisionRepository.findById("dec-1")).thenReturn(Optional.of(decision));
        when(orgMemberRepository.existsByOrgIdAndUserId(any(), any())).thenReturn(true);
        when(commentRepository.save(any(Comment.class))).thenReturn(savedComment);

        var response = decisionService.addComment("dec-1", commentReq, currentUserId);

        assertThat(response.body()).isEqualTo("Nice logic!");
        verify(activityRepository).save(any());
    }

    @Test
    @DisplayName("Should vote on decision and return new score")
    void vote_Success() {
        Decision decision = Decision.builder().id("dec-1").repo(mockRepo).build();
        when(decisionRepository.findById("dec-1")).thenReturn(Optional.of(decision));
        when(orgMemberRepository.existsByOrgIdAndUserId(any(), any())).thenReturn(true);
        when(voteRepository.sumVotesByDecisionId("dec-1")).thenReturn(5);

        var result = decisionService.vote("dec-1", 1, currentUserId);

        assertThat(result.newScore()).isEqualTo(5);
        assertThat(result.userVote()).isEqualTo(1); 
        verify(voteRepository).save(any());
    }

    @Test
    @DisplayName("Should delete decision when user is the author")
    void deleteDecision_AsAuthor_Success() {
        Decision decision = Decision.builder()
                .id("dec-1")
                .author(mockUser)
                .repo(mockRepo)
                .build();
        when(decisionRepository.findByIdWithAuthorRepoOrg("dec-1")).thenReturn(Optional.of(decision));

        decisionService.deleteDecision("dec-1", currentUserId);

        verify(decisionRepository).delete(decision);
    }
}