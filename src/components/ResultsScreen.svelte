<script lang="ts">
	import { Icon, Plus, Minus, Slash } from 'svelte-hero-icons';

	import type { Player, PlayerId, RoundResult } from '$lib/game';

	interface Props {
		players: readonly Player[];
		results: RoundResult;
		onChange: (playerId: PlayerId, tricksWon: number | null) => void;
		round: number;
	}

	let { players, onChange, results, round }: Props = $props();
	let clamp = $derived((value: number | null) =>
		value === null ? null : Math.max(0, Math.min(value, round + 1))
	);

	let activeField = $state<string | null>(null);
	let activeFieldValue = $state<number | null>(0);
	const tricksUnaccountedFor = $derived(
		round +
			1 -
			Object.values(results)
				.map((player) => player.won ?? 0)
				.reduce((acc, x) => acc + x, 0)
	);
</script>

<h3 class="py-4 text-center text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
	Results
</h3>
{#each players as player (player.id)}
	{@const value = activeField === player.id ? activeFieldValue : results[player.id].won}
	{@const valueNum = value ?? 0}
	<div class="mx-auto flex w-64 items-center justify-between py-2">
		<p class="w-32 break-words text-lg font-medium">{player.name}</p>
		<div class="inline-flex w-[12.75rem]">
			<div class="inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
				<button
					class="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 enabled:hover:bg-gray-100"
					tabindex="-1"
					onclick={() => onChange(player.id, valueNum - 1)}
					disabled={valueNum <= 0}
				>
					<span class="sr-only">Decrement</span>
					<Icon src={Minus} class="size-5" />
				</button>
				<input
					type="number"
					class="z-20 block w-full bg-white px-3 py-1.5 text-center text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 [appearance:textfield] placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
					{value}
					onfocus={(e) => {
						(e.target as HTMLInputElement).select();
						activeField = player.id;
						// activeFieldValue needs to be updated first to avoid resetting the value.
						activeFieldValue = value;
					}}
					onblur={() => {
						onChange(player.id, clamp(activeFieldValue));
						activeField = null;
					}}
					onkeydown={(e) => {
						if (e.key === 'Enter') {
							onChange(player.id, clamp(activeFieldValue));
						}
					}}
					onchange={(e) => {
						console.log('onchange');
						const val = (e.target as HTMLInputElement).value.trim();
						activeFieldValue = val === '' ? null : parseInt(val);
					}}
				/>
				<button
					class="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 enabled:hover:bg-gray-100"
					tabindex="-1"
					onclick={() => onChange(player.id, valueNum + 1)}
					disabled={valueNum >= round + 1}
				>
					<span class="sr-only">Increment</span>
					<Icon src={Plus} class="size-5" />
				</button>
			</div>

			<p class="text-md w-8 whitespace-nowrap py-1.5 pl-1.5 pr-3">
				<Icon src={Slash} class="inline size-8" />
				{results[player.id].bid}
			</p>
		</div>
	</div>
{/each}
{#if tricksUnaccountedFor !== 0}
	<p class="text-center text-sm text-gray-500">
		{Math.abs(tricksUnaccountedFor)}
		{Math.abs(tricksUnaccountedFor) === 1 ? 'trick' : 'tricks'}
		{tricksUnaccountedFor > 0 ? 'unaccounted for.' : 'too many reported.'}
	</p>
{/if}
