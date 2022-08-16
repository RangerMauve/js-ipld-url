# js-ipld-url
Parser and serializer for IPLD URLs in JavaScript

Works in the browser, Node.js 16+, and Deno 1.23+

## Example

```JavaScript
import IPLDURL, {IPLDURLSegment} from './ipldurl.js'

const url = new IPLDURL('ipld://examplecidhere/path;param1=value1/to/thing;param2;param3=value2/?queryparam=whatever

const segments = url.segments

segments === [{
  name: 'path',
  parameters: {param1: 'value1'}
}, {
  name: 'to'
}, {
  name: 'thing',
  parameters: {parm2:'', param3: 'value2'}
}]

// Set segments programmatically
url.segments = [{
  // Automatically escape special characters in the name
  name: 'escape;this',
  // Split up arrays into multiple params
  parameters: {whatever:[1,2,3]}
}, {
  name: '😁'
}]

url.href === 'ipld://examplecidhere/escape%3Bthis;whatever=1;whatever=2;whatever=3/%F0%9F%98%81?queryparam=whatever'
```
