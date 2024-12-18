<script lang="ts">
	import { goto } from '$app/navigation';
	import { newGame } from '$lib/firebase';
	import EnterPlayers from '../components/EnterPlayers.svelte';

	let error = $state('');
</script>

<h2 class="pb-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
	Oh Hell Scorekeeper
</h2>
<p class="mt-2 text-gray-600">Enter names in order of play (e.g. clockwise).</p>
<EnterPlayers
	onsubmit={async (players) => {
		error = '';
		try {
			const id = await newGame(players);
			goto(`/${id}`);
		} catch (e) {
			console.log(e);
			if (e instanceof Error) {
				error = e.message;
			} else {
				error = 'An expected error occurred.';
			}
		}
	}}
/>
{#if error}
	<p class="mt-2 text-sm text-red-600">Error: {error}</p>
{/if}
