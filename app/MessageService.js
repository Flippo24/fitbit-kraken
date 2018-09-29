export class MessageService {
    target = null;

    constructor() { }

    say(text) {
        console.log(text);
        this.target.text = text;
    }

    setTarget(element) {
        this.target = element;
    }
}