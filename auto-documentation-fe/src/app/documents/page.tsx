"use client";

import { useAuth } from "@/hooks/useAuth";
import { useOwnerDocuments } from "@/hooks/useDocument";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    FileText,
    Loader2,
    Home,
    Clock,
    CheckCircle2,
    Edit3,
    AlertCircle,
    RefreshCw,
    LogOut,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import Link from "next/link";

const statusConfig: Record<
    string,
    { label: string; color: string; icon: React.ReactNode }
> = {
    generated: {
        label: "생성됨",
        color: "bg-blue-50 text-blue-600 border-blue-200",
        icon: <CheckCircle2 className="w-3 h-3" />,
    },
    edited: {
        label: "수정됨",
        color: "bg-amber-50 text-amber-600 border-amber-200",
        icon: <Edit3 className="w-3 h-3" />,
    },
    reviewed: {
        label: "검토됨",
        color: "bg-emerald-50 text-emerald-600 border-emerald-200",
        icon: <CheckCircle2 className="w-3 h-3" />,
    },
    failed: {
        label: "실패",
        color: "bg-red-50 text-red-600 border-red-200",
        icon: <AlertCircle className="w-3 h-3" />,
    },
};

export default function DocumentsPage() {
    const { user, loading: authLoading, logout } = useAuth();

    const {
        data: documents = [],
        isLoading,
        error,
        refetch,
    } = useOwnerDocuments(user?.github_username || "");

    // 로딩 중
    if (authLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/30 flex items-center justify-center">
                <div className="text-center">
                    <div className="relative">
                        <div className="absolute inset-0 blur-xl bg-primary/20 rounded-full" />
                        <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary mb-4 relative" />
                    </div>
                    <p className="text-muted-foreground">로딩 중...</p>
                </div>
            </div>
        );
    }

    // 로그인하지 않은 경우
    if (!user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/30 flex items-center justify-center p-4">
                <div className="text-center">
                    <p className="text-muted-foreground mb-4">
                        로그인이 필요합니다.
                    </p>
                    <Link href="/">
                        <Button>
                            <Home className="w-4 h-4 mr-2" />
                            홈으로 이동
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Link href="/">
                                <div className="bg-gradient-to-br from-primary to-primary/80 p-2 rounded-xl hover:scale-105 transition-transform cursor-pointer">
                                    <FileText className="w-5 h-5 text-primary-foreground" />
                                </div>
                            </Link>
                            <div>
                                <h1 className="text-xl font-bold">최근 문서</h1>
                                <p className="text-xs text-muted-foreground">
                                    생성된 문서 목록
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link href="/">
                                <Button variant="ghost" size="sm">
                                    <Home className="w-4 h-4 mr-2" />
                                    레포지토리
                                </Button>
                            </Link>
                            <div className="flex items-center gap-3 bg-muted/50 rounded-full pl-4 pr-2 py-1.5">
                                <p className="text-sm font-medium">{user.github_username}</p>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={logout}
                                    title="로그아웃"
                                    className="rounded-full h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                                >
                                    <LogOut className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8 max-w-5xl">
                {/* Section Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full">
                            <FileText className="w-4 h-4" />
                            <span className="text-sm font-medium">최신 문서</span>
                        </div>
                        <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => refetch()}
                        disabled={isLoading}
                    >
                        <RefreshCw
                            className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
                        />
                        새로고침
                    </Button>
                </div>

                {/* 로딩 상태 */}
                {isLoading && (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                )}

                {/* 에러 상태 */}
                {error && (
                    <Card className="border-destructive/50 bg-destructive/5">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3 text-destructive">
                                <AlertCircle className="w-5 h-5" />
                                <p className="font-medium">
                                    문서를 불러오는데 실패했습니다.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* 문서 목록 */}
                {!isLoading && !error && documents.length === 0 && (
                    <Card className="border-dashed">
                        <CardContent className="pt-6">
                            <div className="text-center py-8">
                                <FileText className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                                <p className="text-muted-foreground">
                                    아직 생성된 문서가 없습니다.
                                </p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    레포지토리에 웹훅을 설정하면 푸시 이벤트 시 자동으로 문서가 생성됩니다.
                                </p>
                                <Link href="/">
                                    <Button className="mt-4">
                                        <Home className="w-4 h-4 mr-2" />
                                        레포지토리 설정하기
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {!isLoading && !error && documents.length > 0 && (
                    <div className="space-y-3">
                        {documents.map((doc) => {
                            const status = statusConfig[doc.status] || statusConfig.generated;
                            const [owner, repoName] = doc.repository_name.split("/");

                            return (
                                <Card
                                    key={doc.id}
                                    className="hover:shadow-lg hover:shadow-primary/5 transition-all duration-200 cursor-pointer group hover:border-primary/30"
                                >
                                    <CardContent className="p-5">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">
                                                        {doc.title}
                                                    </h3>
                                                    <Badge
                                                        variant="outline"
                                                        className={`shrink-0 ${status.color}`}
                                                    >
                                                        {status.icon}
                                                        <span className="ml-1">{status.label}</span>
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                                    <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">
                                                        {doc.repository_name}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        {formatDistanceToNow(new Date(doc.created_at), {
                                                            addSuffix: true,
                                                            locale: ko,
                                                        })}
                                                    </span>
                                                </div>
                                            </div>
                                            <Link href={`/?repo=${encodeURIComponent(doc.repository_name)}`}>
                                                <Button variant="outline" size="sm">
                                                    <FileText className="w-4 h-4 mr-2" />
                                                    문서 보기
                                                </Button>
                                            </Link>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </main>
    );
}
