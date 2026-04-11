// src/main/java/dev/mindrepo/decision/dto/DecisionSearchParams.java
package dev.mindrepo.decision.dto;

import dev.mindrepo.decision.DecisionStatus;
import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;

import java.util.List;

public record DecisionSearchParams(
    String repoId,
    DecisionStatus status,
    String search,
    List<String> tags,
    String authorId,
    Integer page,
    Integer size,
    String sort
) {
    public DecisionSearchParams {
        if (page == null) page = 0;
        if (size == null) size = 20;
        if (sort == null) sort = "createdAt,desc";
    }
}

@Component
class StringToDecisionStatusConverter implements Converter<String, DecisionStatus> {
    @Override
    public DecisionStatus convert(String source) {
        if (source == null) return null;
        try {
            return DecisionStatus.valueOf(source.toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}
