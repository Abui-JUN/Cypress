#!/usr/bin/python3
import threading

import requests
import whois
import dns.resolver
import argparse
from queue import Queue, Empty
from threading import Thread

discovered_subdomains = []
list_lock = threading.Lock()

def is_registered(domain_name):
    """
    A function that returns a boolean indicating whether  a domain_name is registered
    """
    try:
        w = whois.whois(domain_name)
    except Exception:
        return False
    else:
        return bool(w.domain_name)


def get_discovered_subdomains(domain):
    # a list of discovered subdomains
    global q

    while not q.empty():
        # construct the url
        subdomain = q.get()
        url = f"http://{subdomain}.{domain}"
        try:
            requests.get(url, timeout=2)
        except requests.ConnectionError:
            pass
        except requests.exceptions.InvalidURL:
            pass
        else:
            print("[+] Discovered subdomain:", url)
            with list_lock:
                discovered_subdomains.append(url)
        q.task_done()


def resolve_dns_records(target_domain):
    """ A function that resolves DNS records for a domain"""
    record_types = ["A", "AAAA", "CNAME", "MX", "NS", "SOA", "TXT"]
    resolver = dns.resolver.Resolver()
    for record_type in record_types:
        try:
            answers = resolver.resolve(target_domain, record_type)
        except dns.resolver.NoAnswer:
            continue
        print(f"DNS records for {target_domain} ({record_type}):")
        for rdata in answers:
            print(rdata)


if __name__ == "__main__":
    q = Queue()
    parser = argparse.ArgumentParser(
        description="Domain name information extractor, uses WHOIS db and scans for subdomains")
    parser.add_argument("domain", help="The domain name without http(s)")
    parser.add_argument("-s", "--subdomains", default="subdomains.txt",
                        help="The file path that contains the list of subdomains to scan, default is subdomains.txt")
    parser.add_argument("-o", "--output",
                        help="The output file path resulting the discovered subdomains, default is {"
                             "domain}-subdomains.txt")

    args = parser.parse_args()
    if is_registered(args.domain):
        whois_info = whois.whois(args.domain)
        print("Domain registrar: ", whois.whois(whois_info.registrar))
        print("WHOIS server: ", whois_info.whois_server)
        print("Domain creation date: ", whois_info.creation_date)
        print("Expiration date: ", whois_info.expiration_data)
        print(whois_info)
    print("\n","=" * 50, "DNS records", "=" * 50)
    resolve_dns_records(args.domain)
    print("\n","=" * 50, "Scanning subdomains", "=" * 50)

    with open(args.subdomains) as file:
        content = file.read()
        subdomains = content.splitlines()
    for subdomain in subdomains:
        q.put(subdomain)

    for i in range(10):
        worker = Thread(target=get_discovered_subdomains,args=(args.domain,))
        worker.daemon = True
        worker.start()

    q.join()

    discovered_subdomains_file = f"{args.domain}-subdomains.txt"

    with open(discovered_subdomains_file, "w") as f:
        for subdomain in discovered_subdomains:
            print(subdomain, file=f)
