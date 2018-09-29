export class MessageService {
    target = null;

    constructor() { }

    say(text) {
        console.log(text);
        this.target.text = text;
    }

    add(text) {
        console.log(text);
        this.target.text = this.target.text + "\n" + text;
    }

    setTarget(element) {
        this.target = element;
    }
}