<script lang="ts">
	import { page } from '$app/stores';
	import {
		GameNotFoundError,
		newGame,
		onGameUpdate,
		updateBid,
		updateCurrentRound,
		updateTricksWon
	} from '$lib/firebase';
	import { Game } from '$lib/game';

	import BiddingScreen from '../../components/BiddingScreen.svelte';
	import ResultsScreen from '../../components/ResultsScreen.svelte';
	import HistoryTable from '../../components/HistoryTable.svelte';
	import HistoryChart from '../../components/HistoryChart.svelte';
	import GameOverScreen from '../../components/GameOverScreen.svelte';
	import { goto } from '$app/navigation';

	let game = $state<Game | null>(null);
	const gameId = $page.params.gameId;
	let error = $state<string>('');
	let validationError = $state<string>('');

	let gameNotFound = $state(false);

	$effect(() => {
		return onGameUpdate(
			gameId,
			(data) => {
				error = '';
				game = data;
			},
			(e) => {
				if (e instanceof GameNotFoundError) {
					gameNotFound = true;
				} else if (e instanceof Error) {
					error = e.message;
				} else {
					error = 'unknown error: ' + e;
				}
			}
		);
	});
</script>

<h2 class="pb-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Oh Hell</h2>

{#if gameNotFound}
	<p class="text-md font-medium"><b>404</b>. Game not found.</p>
{:else if error}
	<p class="text-md font-medium text-red-600">
		An error occurred: {error}
	</p>
{:else if game !== null}
	<p class="text-md font-medium text-gray-500">
		{game.isOver() ? 'Game Complete' : `Round ${game.currentRound + 1} of ${game.totalRounds()}`} | Dealer:
		{game.currentDealer().name} | Game
		{gameId}
	</p>
	{#if game.isOver()}
		<GameOverScreen {game} />
	{:else if game.currentBidder() !== null}
		{game.players.map((p) => p.id).join(', ')}
		<BiddingScreen
			bidderName={game.currentBidder()?.name ?? ''}
			maxBid={game.currentRound + 1}
			disabledBid={game.disabledBid()}
			selectedBid={null}
			onBid={async (bid) => {
				if (game === null) {
					throw new Error('Game was unexpectedly null.');
				}

				await updateBid(game, game.currentRound, game.currentBidder()!.id, bid);
			}}
		/>
	{:else}
		<ResultsScreen
			players={game.players}
			results={game.round()}
			round={game.currentRound}
			onChange={async (playerId, tricksWon) => {
				validationError = '';
				if (game === null) {
					throw new Error('Game was unexpectedly null.');
				}
				await updateTricksWon(game, game.currentRound, playerId, tricksWon);
			}}
		/>
		{#if validationError}
			<p class="text-md text-center font-medium text-red-600">
				{validationError}
			</p>
		{/if}
	{/if}

	<p class="pt-4 text-center font-medium">
		{#if game.currentRound > 0 || game.currentBidder()?.id !== game.firstBidder().id}
			<button
				class="text-blue-600 hover:text-blue-500 hover:underline"
				onclick={async () => {
					if (game === null) {
						throw new Error('Game was unexpectedly null.');
					}
					if (game.currentBidder()?.id !== game.firstBidder().id) {
						const currentBidder = game.currentBidder()?.id;

						await updateBid(
							game,
							game.currentRound,
							currentBidder ? game.playerAfter(currentBidder, -1).id : game.currentDealer().id,
							null
						);
					} else {
						if (game.currentRound === 0) {
							throw new Error('Internal error: current round is 0.');
						}
						console.log('hi', game.currentRound, game.currentRound - 1);
						await updateCurrentRound(game, game.currentRound - 1);
					}
				}}>Back {game.currentBidder() === null ? 'to Bidding' : ''}</button
			>
		{/if}
		{#if game.currentBidder() === null}
			<button
				type="submit"
				class="mx-4 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
				onclick={async () => {
					validationError = '';
					if (game === null) {
						throw new Error('Game was unexpectedly null.');
					}
					const totalTaken = Object.values(game.round())
						.map((player) => player.won ?? 0)
						.reduce((acc, x) => acc + x, 0);
					if (totalTaken !== game.currentRound + 1) {
						validationError = `Total tricks won must equal ${game.currentRound + 1} (currently ${totalTaken}).`;
						return;
					}
					await updateCurrentRound(game, game.currentRound + 1);
				}}
			>
				{game.currentRound + 1 < game.totalRounds() ? 'Next Round' : 'End Game'}
			</button>
		{:else if game.isOver()}
			<button
				class="mx-4 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
				onclick={async () => {
					const id = await newGame(
						game!.players.map((p) => p.name),
						game!.scoringFormula
					);
					goto(`/${id}`);
				}}
			>
				Play Again
			</button>
		{/if}
	</p>

	{#if game.currentRound > 0}
		<h3
			class="pb-2 pt-8 text-center text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl"
		>
			History
		</h3>
		<HistoryChart {game} />
		<HistoryTable {game} />
	{/if}
{:else}
	<p>Loading...</p>
{/if}
