import SyntaxHighlighter from "@/components/SyntaxHighlighter";

export default function WritingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <SyntaxHighlighter />
            {children}
        </>
    );
}
