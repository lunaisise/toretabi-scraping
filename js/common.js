class common {
    /**
     * 
     * @param {String} text 
     * @returns Document
     */
    static textToNode(text) {
        return new DOMParser().parseFromString(text, 'text/html');
    }
}
export default common;