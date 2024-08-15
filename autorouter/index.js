import { Router } from '../router/index.js'
import { error, json, withParams } from 'itty-router';

export const AutoRouter = ({
  format = json,
  missing = () => error(404),
  finally: f = [],
  before = [],
  ...options } = {}
) => Router({
  before: [
    withParams,
    ...before
  ],
  catch: error,
  finally: [
    (r, ...args) => r ?? missing(r, ...args),
    format,
    ...f,
  ],
  ...options,
});