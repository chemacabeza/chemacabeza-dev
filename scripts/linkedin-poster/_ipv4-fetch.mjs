// Side-effect import: make Node's global fetch prefer IPv4 and not race IPv6.
//
// Some hosts (and our dev/CI environments) resolve to an IPv6 address that
// isn't actually routable. undici's fetch then defaults to that address and
// hangs until UND_ERR_CONNECT_TIMEOUT, even though IPv4 is reachable. curl,
// raw TCP, and node's https module all fall back to IPv4 fine — only fetch
// doesn't. This is the programmatic equivalent of launching node with
// `--dns-result-order=ipv4first --no-network-family-autoselection`, so the
// scripts "just work" without anyone having to remember those flags.
//
// Import this FIRST, before any module that issues a fetch().
import dns from 'node:dns';
import net from 'node:net';

dns.setDefaultResultOrder('ipv4first');
net.setDefaultAutoSelectFamily(false);
