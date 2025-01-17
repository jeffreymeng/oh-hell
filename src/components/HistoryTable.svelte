<script lang="ts">
	import type { Game } from '$lib/game';

	interface Props {
		game: Game;
	}
	let { game }: Props = $props();
</script>

<div class="flow-root pt-12">
	<div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
		<div class="inline-block w-full py-2 align-middle sm:px-6 lg:px-8">
			<div class="divide-y divide-gray-300">
				<div class="flex divide-x divide-gray-200">
					<div
						class="w-8 px-4 py-3.5 text-left text-right text-sm font-semibold text-gray-900"
					></div>
					<div class="grid flex-1 grid-cols-{game.players.length} divide-x divide-gray-200">
						{#each game.players as player}
							<div class="min-w-0 px-4 py-3.5 text-center text-sm font-semibold text-gray-900">
								<p class="truncate">{player.name}</p>
							</div>
						{/each}
					</div>
				</div>

				<div class="flex divide-x divide-gray-200 font-bold">
					<div class="w-8 py-4 text-center text-sm font-bold text-gray-900">∑</div>
					<div class="grid flex-1 grid-cols-{game.players.length} divide-x divide-gray-200">
						{#each game.players as player}
							<div class="min-w-0 p-4 text-center text-sm text-gray-500">
								<p class="truncate">{game.playerScore(player.id)}</p>
							</div>
						{/each}
					</div>
				</div>

				{#each Array(game.currentRound)
					.fill(null)
					.map((_, i) => i)
					.reverse() as roundIndex}
					<div class="group flex divide-x divide-gray-200 hover:bg-gray-100">
						<div class="w-8 py-4 text-center text-sm font-bold text-gray-900">
							{roundIndex + 1}
						</div>
						<div class="grid flex-1 grid-cols-{game.players.length} divide-x divide-gray-200">
							{#each game.players as player}
								{@const roundData = game.round(roundIndex)[player.id]}
								{@const won = roundData.won ?? 0}
								{@const bid = roundData.bid ?? 0}
								<div
									class="min-w-0 p-4 text-center text-sm text-gray-500"
									class:bg-green-100={won === bid}
									class:bg-yellow-100={won < bid}
									class:bg-orange-100={won > bid}
									class:group-hover:bg-green-200={won === bid}
									class:group-hover:bg-yellow-200={won < bid}
									class:group-hover:bg-orange-200={won > bid}
								>
									<p class="truncate">
										{`${won}/${bid}`}
									</p>
								</div>
							{/each}
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>
