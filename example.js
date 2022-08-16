import IPLDURL from './ipldurl.js'

const url = new IPLDURL('ipld://example/foo;bar=baz/fizz/?buzz=foobar')

const segments = url.segments

console.log(url.href, segments)

segments[1].set('example','Hello;World!')

url.segments = segments

console.log(url.href, url.segments)

url.segments = [{
  // Automatically escape special characters from the name
  name: 'escape;this',
  // Split up arrays into multiple params
  parameters: {whatever:[1,2,3]}
}, {
  name: '😁'
}]

console.log(url.href, url.segments)

