export function downloadText(filename: string, text: string, mimeType: string) {
    const blob = new Blob([text], {type: mimeType});
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
