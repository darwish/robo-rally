class Chat {
    private static runs: { [robotID: string]: number } = {};

    static async say(message: string, player = clientGame.clientId, speakRobot = true) {
        if (!Chat.runs[player.id])
            Chat.runs[player.id] = 0;

        if (speakRobot)
            message = Chat.translate(message);

        let run = ++Chat.runs[player.id];
        let robot = clientGame.getRobot(player);
        const trianglePoint = new Point(36, 24);

        let bubble = $('.speech-bubble').filter((i, x) => $(x).data('robot') == robot);
        if (!bubble.length)
            bubble = $('<div>').addClass('speech-bubble scale0').data('robot', robot).appendTo('#gameContainer');

        bubble.text(message);
        let p = Point.subtract(robot.position.toPixelPosition(), trianglePoint);
        let offset = $(phaserGame.canvas).offset();
        p.add(offset.left + robot.sprite.width / 2, offset.top - bubble[0].offsetHeight);
        bubble.css({ left: p.x, top: p.y });


        // animate in, wait 10s, animate out.
        await delay(20);
        if (run == Chat.runs[robot.playerID]) { // can't cancel JavaScript Promises. Workaround: track if say() was called again for the current robot before this call finished.
            bubble.css('transform', 'scale(1)');

            await delay(5000);
            if (run == Chat.runs[robot.playerID])
                bubble.css('transform', 'scale(0)');
        }
    }

    static translate(englishMessage: string) {
        const robotWords = ['beep', 'bleep', 'bop', 'boop', 'beeboop', 'bzzrt', 'grrtzz', 'wrrl', 'drzz', 'weeoo', 'weeooee', 'click', 'clack',
            'bzz', 'buzz', 'buzzap', 'zap', 'zip', 'zoop', 'zop', 'fwoosh', 'fweeoosh', 'boom', 'bam', 'bang'];

        return englishMessage.toLowerCase().replace(/[a-zA-Z0-9_']+/g, x => robotWords[x.hash() % robotWords.length]).toSentenceCase();
    }

    static initialize(chatBox: JQuery | string | Element) {
        chatBox = $(chatBox);
        let chat = <HTMLInputElement>chatBox[0];
        
        $(document).on('keydown', function (e) {
            if (e.keyCode == 192) {   // backtick (`) key
                if (chat.disabled) {
                    chat.style.bottom = '0px';
                    chat.disabled = false;
                    chat.focus();
                    e.preventDefault();
                } else {
                    chat.style.bottom = '-30px';
                    chat.disabled = true;
                    chat.value = '';
                }
            }
        });

        chatBox.on('keydown', function (e) {
            if (e.keyCode == 13) {   // enter key
                Chat.say(chat.value);
                socket.emit('chat', { message: chat.value });
                chat.value = '';
            }
        });

        socket.on('chat', data => {
            Chat.say(data.message, data.sender);
        });
    }
}
