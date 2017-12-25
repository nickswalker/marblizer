// Taken from this stack overflow answer: http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
export function getParameterByName(name: string, url?: string) {
    if (!url) {
        url = window.location.href;
    }
    name = name.replace(/[\[\]]/g, "\\$&");
    let regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}