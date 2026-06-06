export const defaultHeaders = (defaultHeadersVal: Record<string, string>) => ({
  // @ts-expect-error - legacy
  init(context, next) {
    const { headers = {} } = context.state.request;
    context.state.request.headers = {
      ...defaultHeadersVal,
      ...headers,
    };
    next();
  },
});
