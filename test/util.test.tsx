import { resolve } from '../src/navigation';

test('resolve fn()', () => {
  const location = `/app/home/profile/0`;

  expect(resolve(`two`, `/app/home/profile/:id`, location)).toEqual(
    `/app/home/profile/0/two`
  );

  expect(resolve(`../two`, `/app/home/profile/:id`, location)).toEqual(
    `/app/home/profile/two`
  );

  expect(resolve(`./two`, `/app/home/profile/:id`, location)).toEqual(
    `/app/home/profile/0/two`
  );

  expect(resolve(`../:id/two`, `/app/home/profile/0`, location)).toEqual(
    `/app/home/profile/0/two`
  );

  expect(
    resolve(`../../profile/../profile/:id/two`, `/app/home/profile/0`, location)
  ).toEqual(`/app/home/profile/0/two`);

  expect(resolve(`../../`, `/leafs/p/:slug`, location)).toEqual(`/leafs`);
});
