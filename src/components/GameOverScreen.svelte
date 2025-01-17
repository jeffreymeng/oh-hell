<script lang="ts">
	import type { Game } from '$lib/game';

	interface Props {
		game: Game;
	}
	let { game }: Props = $props();

	const standings = $derived(
		game.players
			.map((player, i) => ({
				name: player.name,
				points: game.playerScore(player.id),
				// the last player is dealer first, then the first player, and so on
				firstDealerRound: (game.players.length - 1 + i) % game.players.length
			}))
			.sort((a, b) => {
				if (a.points !== b.points) {
					return b.points - a.points;
				}
				// the tiebreaker is the first round in which a player was dealer
				// (if a player was first dealer earlier in the game, they win ties)
				return a.firstDealerRound - b.firstDealerRound;
			})
	);
</script>

<h3 class="py-4 text-center text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
	Game Over!
</h3>

<div class="mx-auto max-w-lg">
	<table class="min-w-full divide-y divide-gray-300">
		<thead>
			<tr>
				<th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
					Place
				</th>
				<th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
					Player
				</th>
				<th scope="col" class="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
					Points
				</th>
			</tr>
		</thead>
		<tbody class="divide-y divide-gray-200">
			{#each standings as { name, points }, i}
				<tr>
					<td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
						{i + 1}{i === 0 ? 'st' : i === 1 ? 'nd' : i === 2 ? 'rd' : 'th'}
					</td>
					<td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{name}</td>
					<td class="whitespace-nowrap px-3 py-4 text-right text-sm text-gray-500">{points}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<div class="mt-8 flex justify-center">
	<a
		href="/"
		class="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
	>
		New Game
	</a>
</div>
