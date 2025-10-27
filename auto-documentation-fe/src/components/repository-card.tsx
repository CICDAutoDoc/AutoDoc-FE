import { GitHubRepo } from "@/lib/github";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, GitFork, Calendar } from "lucide-react";

interface RepositoryCardProps {
  repo: GitHubRepo;
}

export function RepositoryCard({ repo }: RepositoryCardProps) {
  const formattedDate = new Date(repo.updated_at).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-4">
          <img
            src={repo.owner.avatar_url}
            alt={repo.owner.login}
            className="w-12 h-12 rounded-full"
          />
          <div className="flex-1">
            <CardTitle className="text-2xl">
              <a
                href={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                {repo.full_name}
              </a>
            </CardTitle>
            <CardDescription className="mt-1">
              {repo.description || "No description provided"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4" />
            <span>{repo.stargazers_count.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <GitFork className="w-4 h-4" />
            <span>{repo.forks_count.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{formattedDate}</span>
          </div>
        </div>

        {(repo.language || repo.topics?.length > 0) && (
          <div className="flex flex-wrap items-center gap-2 mt-4">
            {repo.language && (
              <Badge variant="secondary">{repo.language}</Badge>
            )}
            {repo.topics?.slice(0, 5).map((topic) => (
              <Badge key={topic} variant="outline">
                {topic}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
