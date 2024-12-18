<script lang="ts">
	import { page } from '$app/stores';
	import { onGameUpdate, updateBid } from '$lib/firebase';
	import { Game } from '$lib/game';
	import BiddingScreen from '../../components/BiddingScreen.svelte';
	let game = $state<Game | null>(null);
	const gameId = $page.params.gameId;
	let error = $state<string>('');

	$effect(() => {
		return onGameUpdate(
			gameId,
			(data) => {
				error = '';
				game = data;
			},
			(e) => {
				if (e instanceof Error) {
					error = e.message;
				} else {
					error = 'unknown error: ' + e;
				}
			}
		);
	});
</script>

<h2 class="pb-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Oh Hell</h2>

{#if error}
	<p class="text-md font-medium text-red-600">
		An error occurred: {error}
	</p>
{:else if game !== null}
	<p class="text-md font-medium text-gray-500">
		Round {game.currentRound() + 1} | Dealer: {game.currentDealer().name} | Game {gameId}
	</p>
	<BiddingScreen
		bidderName={game.currentBidder()?.name ?? ''}
		maxBid={game.currentRound() + 1}
		disabledBid={game.disabledBid()}
		selectedBid={null}
		onBid={async (bid) => {
			if (game === null) {
				throw new Error('Game was unexpectedly null.');
				return;
			}
			await updateBid(game, game.currentRound(), game.currentBidder()!.id, bid);
		}}
	/>
	<!-- todo: Jump to [player] -->
	<p class="text-center font-medium">
		<button class="text-blue-600 hover:text-blue-500 hover:underline">Back</button>
	</p>
	<h3 class="pb-2 pt-8 text-center text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
		History
	</h3>
	<p class="text-right font-medium">
		<button class="text-blue-600 hover:text-blue-500 hover:underline">Show Points</button>
	</p>
	<!-- todo: maybe tabs? points/bids/chart -->

	<div class="flow-root">
		<div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
			<div class="inline-block w-full py-2 align-middle sm:px-6 lg:px-8">
				<div class="divide-y divide-gray-300">
					<!-- Header row -->
					<div class="flex divide-x divide-gray-200">
						<div
							class="w-8 px-4 py-3.5 text-left text-right text-sm font-semibold text-gray-900"
						></div>
						<div class="grid flex-1 grid-cols-2 divide-x divide-gray-200">
							<div class="min-w-0 px-4 py-3.5 text-center text-sm font-semibold text-gray-900">
								<p class="truncate">Player 1</p>
							</div>
							<div class="min-w-0 px-4 py-3.5 text-center text-sm font-semibold text-gray-900">
								<p class="truncate">Player 2</p>
							</div>
						</div>
					</div>

					<!-- Data row -->
					<div class="flex divide-x divide-gray-200 font-bold even:bg-gray-100">
						<div class="w-12 py-4 text-center text-sm font-bold text-gray-900">Total</div>
						<div class="grid flex-1 grid-cols-2 divide-x divide-gray-200">
							<div class="min-w-0 p-4 text-center text-sm text-gray-500">
								<p class="truncate">73</p>
							</div>
							<div class="min-w-0 p-4 text-center text-sm text-gray-500">
								<p class="truncate">65</p>
							</div>
						</div>
					</div>
					<div class="flex divide-x divide-gray-200 even:bg-gray-100">
						<div class="w-8 py-4 text-center text-sm font-bold text-gray-900">1</div>
						<div class="grid flex-1 grid-cols-2 divide-x divide-gray-200">
							<div class="min-w-0 p-4 text-center text-sm text-gray-500">
								<p class="truncate">3/1</p>
							</div>
							<div class="min-w-0 p-4 text-center text-sm text-gray-500">
								<p class="truncate">3/1</p>
							</div>
						</div>
					</div>
					<div class="flex divide-x divide-gray-200 even:bg-gray-100">
						<div class="w-8 py-4 text-center text-sm font-bold text-gray-900">1</div>
						<div class="grid flex-1 grid-cols-2 divide-x divide-gray-200">
							<div class="min-w-0 p-4 text-center text-sm text-gray-500">
								<p class="truncate">3/1</p>
							</div>
							<div class="min-w-0 p-4 text-center text-sm text-gray-500">
								<p class="truncate">3/1</p>
							</div>
						</div>
					</div>
					<div class="flex divide-x divide-gray-200 even:bg-gray-100">
						<div class="w-8 py-4 text-center text-sm font-bold text-gray-900">1</div>
						<div class="grid flex-1 grid-cols-2 divide-x divide-gray-200">
							<div class="min-w-0 p-4 text-center text-sm text-gray-500">
								<p class="truncate">3/1</p>
							</div>
							<div class="min-w-0 p-4 text-center text-sm text-gray-500">
								<p class="truncate">3/1</p>
							</div>
						</div>
					</div>
					<div class="flex divide-x divide-gray-200 even:bg-gray-100">
						<div class="w-8 py-4 text-center text-sm font-bold text-gray-900">1</div>
						<div class="grid flex-1 grid-cols-2 divide-x divide-gray-200">
							<div class="min-w-0 p-4 text-center text-sm text-gray-500">
								<p class="truncate">3/1</p>
							</div>
							<div class="min-w-0 p-4 text-center text-sm text-gray-500">
								<p class="truncate">3/1</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- table: rows = "round 1, round 2, round 3, etc" cols = player names. Cell = "3/5", "6/5" won/bid -->
	<!-- slider to switch between points and bid -->
{:else}
	<p>Loading...</p>
{/if}
