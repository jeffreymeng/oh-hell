<script lang="ts">
	import type { Game } from '$lib/game';
	import { LineChart } from 'layerchart';

	interface Props {
		game: Game;
	}
	let { game }: Props = $props();

	const includeCurrentRound = $derived(game.currentBidder() === null); // zero indexed
	const lastRound = $derived(includeCurrentRound ? game.currentRound + 1 : game.currentRound);

	const LINE_COLORS = ['#0891b2', '#16a34a', '#ea580c', '#dc2626', '#db2777', '#6d28d9'];
</script>

<div class="h-96 w-full">
	<LineChart
		data={Array(lastRound + 1)
			.fill(null)
			.map((_, i) => ({
				round: i,
				...Object.fromEntries(
					game!.players.map((player) => [player.id, game!.playerScore(player.id, i)])
				)
			}))}
		x="round"
		xDomain={[0, lastRound]}
		props={{
			xAxis: {
				ticks: (scale) => scale.ticks?.().filter(Number.isInteger)
			}
		}}
		series={game.players
			.map((player, i) => ({ key: player.name, color: LINE_COLORS[i] }))
			.sort((a, b) => a.key.localeCompare(b.key))}
	></LineChart>
</div>
