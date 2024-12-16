<script lang="ts">
	import EnterPlayers from '../components/EnterPlayers.svelte';
</script>

<h2 class="pb-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
	Oh Hell Scorekeeper
</h2>
<p class="mt-2 text-gray-600">Enter names in order of play (e.g. clockwise).</p>
<EnterPlayers onsubmit={(players) => alert(players)} />

<!-- todo: choose players here -->
<!-- todo: when you finish a game, you can create a new game with same or different players -->
<!-- todo: you can log into an account and link a player to your account, which will allow you to see stats -->
