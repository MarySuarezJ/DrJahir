const cloudflareConfig = {
  default: {
    override: {
      wrapper: "cloudflare-node",
      converter: "edge",
      proxyExternalRequest: "fetch",
      incrementalCache: "dummy",
      tagCache: "dummy",
      queue: "dummy"
    },
    routePreloadingBehavior: "none"
  },
  edgeExternals: ["node:crypto"],
  cloudflare: {
    useWorkerdCondition: true
  },
  dangerous: {
    enableCacheInterception: false
  },
  middleware: {
    external: true,
    override: {
      wrapper: "cloudflare-edge",
      converter: "edge",
      proxyExternalRequest: "fetch",
      incrementalCache: "dummy",
      tagCache: "dummy",
      queue: "dummy"
    }
  }
};

export default cloudflareConfig;
