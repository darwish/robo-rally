enum GameState {
	Initializing,
	WaitingForPlayerInput,
	PlayingActions,
}

class Game {
	public gameState: GameState = GameState.Initializing;
	public globalCardDeck: CardDeck<ProgramCard>;
	public cards: ProgramCard[];
	public selectedCards: ProgramCard[] = [];
	public playerSubmittedCards: { [key: string]: ProgramCard[]; } = {};

	public waitForPlayers() {
		this.showWaitingPlayers(clientGame);

		if (clientGame.isHost()) {
			socket.on('joined', (client) => {
				clientGame.addPlayer(client);

				if (clientGame.isHost()) {
					socket.emit('broadcastPlayers', clientGame.getPlayers());
				}

				this.showWaitingPlayers(clientGame);
			});
		} else {
			this.waitForCards();

			socket.on('broadcastPlayers', (players) => {
				clientGame.setPlayers(players);
				this.showWaitingPlayers(clientGame);
			});
		}
	}

	public showWaitingPlayers(clientGame: ClientGame) {
		$('.playersList').empty();
		clientGame.getPlayers().forEach((player) => {
			var playerItem = $('<li class="playerItem">' + player.friendlyName + '</li>');
			playerItem.data('player', player);
			$('.playersList').append(playerItem);
		});
	}

	public startGame() {
		$('.startGame').addClass("hidden");
		$('.quitGame').removeClass("hidden");

		socket.off('joined');
		socket.off('broadcastPlayers');

		this.startNewTurn();
	}

	private startNewTurn() {
		this.gameState = GameState.WaitingForPlayerInput;

		var players = clientGame.getPlayers();
		var handSizes = players.map(() => 9);
		var hands = this.dealCards(handSizes);

		var handData = {};
		for (let i = 0; i < players.length; i++) {
			handData[players[i].id] = hands[i];
		}
		socket.emit('dealtCards', handData);

		this.showCards(hands[0]);
		this.waitForAllSubmissions();
	}

	public quitGame() {
		window.location.href = "/";
	}

	public waitForCards() {
		socket.on('dealtCards', (handData) => {
			socket.off('dealtCards');

			var cardData = handData[clientGame.player.id];
			this.cards = cardData.map((c) => new ProgramCard(c.type, c.distance, c.priority));
			this.showCards(this.cards);

			this.waitForAllSubmissions();
		});
	}

	public waitForAllSubmissions() {

		socket.on('submitTurn', (submittedTurn) => {
			this.playerSubmittedCards[submittedTurn.sender] = submittedTurn.cards.map(c => new ProgramCard(c.type, c.distance, c.priority));

			$('.playersList .playerItem').filter(function () { return $(this).data('player').id == submittedTurn.sender; }).addClass('submitted');

			if (this.allPlayersSubmitted()) {
				socket.off('submitTurn');
				this.runNextTurnAsync();
			}
		});
	}

	public showCards(cards: ProgramCard[]) {
		$('.playerControls').removeClass('hidden');
		$('.statusText').html('Choose Your Cards');

		$('.cardContainer').empty();
		cards.forEach((card) => {
			var cardChoice = $(`<li class="cardChoice" title="${card.toString()}">${card.toHtml()}<span class="phaseOrder"></span></li>`);
			cardChoice.data('card', card);
			$('.cardContainer').append(cardChoice);
		});

		$('.cardContainer').append(`<a href=# class="collapse" onclick="$('.cardContainer').toggleClass('collapsed')"></a>`);
	}

	public dealCards(handSizes: number[]) {
		// return all cards to the deck (by simply recreating the deck in its initial state)
		this.globalCardDeck = CardDeck.newProgramDeck();
		return this.globalCardDeck.deal(handSizes);
	}

	public chooseCard(element) {
		var card = $(element).data('card');

		if ($(element).hasClass('selected')) {
			this.selectedCards.splice(this.selectedCards.indexOf(card), 1);
			$(element).removeClass('selected');
			$(element).find('.phaseOrder').text('');
			$('.submitCards').addClass('hidden');
		} else {
			if (this.selectedCards.length < 5) {
				this.selectedCards.push(card);
				$(element).addClass('selected');
				$(element).find('.phaseOrder').text(this.selectedCards.length);

				if (this.selectedCards.length == 5) {
					$('.submitCards').removeClass('hidden');
				} else {
					$('.submitCards').addClass('hidden');
				}
			}
		}

		// update phase order
		$('.cardContainer .cardChoice').each((i, el) => {
			let index = this.selectedCards.indexOf($(el).data('card'));
			return $(el).find('.phaseOrder').text(index < 0 ? '' : index + 1);
		});

	}

	public submitSelectedCards() {
		if (this.selectedCards.length != 5) {
			alert("You must choose 5 cards to submit. You've only chosen " + this.selectedCards.length + ".");
			return;
		}

		this.playerSubmittedCards[clientGame.player.id] = this.selectedCards;
		$('.playersList .playerItem').filter(function () { return $(this).data('player').id == clientGame.player.id; }).addClass('submitted');

		socket.emit('submitTurn', {
			cards: this.selectedCards
		});

		clientGame.getRobot().registeredProgramCards = this.selectedCards;
		this.selectedCards = [];

		if (this.allPlayersSubmitted())
			this.runNextTurnAsync();
	}

	public allPlayersSubmitted() {
		return Object.keys(this.playerSubmittedCards).length == clientGame.getPlayers().length;
	}

	public async runNextTurnAsync() {
		this.gameState = GameState.PlayingActions;

		var turns: RobotTurn[] = [];
		for (let clientId in this.playerSubmittedCards) {
			var robot = Board.Instance.robots.filter(r => r.playerID == clientId)[0];
			turns.push(new RobotTurn(robot, this.playerSubmittedCards[clientId]));
		}

		if (clientGame.isHost())
			this.startNewTurn();
		else
			this.waitForCards();

		await Board.Instance.runTurnAsync(turns);

		this.playerSubmittedCards = {};
		$('.playersList .playerItem').removeClass('submitted');
	}
}