export const SEGMENT_SEPARATOR = '/'
export const PARAMETER_SEPARATOR = ';'
export const PARAMETER_SEPARATOR_REGEX = /;/g
export const ENCODED_SEPARATOR = '%3B'
export const ENCODED_SEPARATOR_REGEX = /%3B/g

export const PARAMETER_EQUALS = '='

export class IPLDURL extends URL {
  constructor (...args) {
    super(...args)
    if (this.protocol !== 'ipld:') {
      throw new Error('IPLD URLs must start with `ipld://`')
    }
  }

  get segments () {
    return IPLDURLSegments.decode(this.pathname)
  }

  set segments (segments) {
    this.pathname = IPLDURLSegments.encode(segments)
  }
}

export class IPLDURLSegments {
  static encode (segments) {
    return segments
      .map((segment) => {
        if (typeof segment === 'string') {
          return encode(segment)
        } else if (segment instanceof IPLDURLSegment) {
          return segment.toString()
        } else if ((typeof segment === 'object') && ('name' in segment)) {
          const segmentObject = new IPLDURLSegment(segment.name, segment.parameters)
          console.log(segmentObject)
          return segmentObject.toString()
        } else {
          throw new Error('Segment must be a string name, an IPLDURLSegment object, or a plain object with a `name` and `parameters`')
        }
      })
      .join('/')
  }

  static decode (pathname) {
    return pathname
      .split(SEGMENT_SEPARATOR)
      .filter((segment) => segment)
      .map((segment) => new IPLDURLSegment(segment))
  }
}

export class IPLDURLSegment {
  #entries = []
  #name = ''

  constructor (name, init) {
    const hasInit = init !== undefined
    if (hasInit) {
      this.name = name
      if (init) {
        this.parameters = init
      }
    } else {
      const [realName, ...paramPairs] = name.split(PARAMETER_SEPARATOR)
      this.name = realName
      for (const pair of paramPairs) {
        const [key, value] = pair.split(PARAMETER_EQUALS)
        const decodedKey = decodeURIComponent(key)
        const decodedValue = decodeURIComponent(value || '')
        this.#entries.push([decodedKey, decodedValue])
      }
    }
  }

  #inspect() {
    return this.name + ' ' + JSON.stringify(this.parameters)

  }

  [Symbol.for('Deno.customInspect')] () {
    return this.#inspect()
  }

  [Symbol.for('nodejs.util.inspect.custom')] () {
    return this.#inspect()
  }

  get name () {
    return this.#name
  }

  set name (name) {
    this.#name = decodeURIComponent(name)
  }

  get parameters () {
    const parameters = {}
    for (const [key, value] of this.#entries) {
      if (key in parameters) {
        parameters[key] = [].concat(parameters[key], value)
      } else {
        parameters[key] = value
      }
    }
    return parameters
  }

  set parameters (parameters) {
    const iterator = parameters[Symbol.iterator] ? parameters : Object.entries(parameters)
    this.#entries = []
    for (const [key, value] of iterator) {
      if (Array.isArray(value)) {
        for (const subValue of value) {
          this.#entries.push([key, subValue])
        }
      } else {
        this.#entries.push([key, value])
      }
    }
  }

  append (key, value) {
    this.#entries.push([key, value])
  }

  delete (key) {
    this.#entries = this.#entries.filter(([entryKey]) => entryKey !== key)
  }

  get (key) {
    for (const [entryKey, value] of this.#entries) {
      if (entryKey === key) return value
    }
    return null
  }

  getAll (key) {
    return this.#entries
      .filter(([entryKey]) => entryKey === key)
      .map(([entryKey, value]) => value)
  }

  has (key) {
    for (const [entryKey] of this.#entries) {
      if (entryKey === key) return true
    }
    return false
  }

  * entries () {
    yield * this.#entries
  }

  * keys () {
    yield * this.entries.map(([key]) => key)
  }

  * values () {
    yield * this.entries.map(([key, value]) => value)
  }

  set (key, value) {
    for (const entry of this.#entries) {
      const [entryKey] = entry
      if (entryKey !== key) continue
      entry[1] = value
      return
    }
    this.#entries.push([key, value])
  }

  toString () {
    const encodedName = encode(this.#name)
    const segments = this.#entries.map(([key, value]) => {
      return `;${encode(key)}=${encode(value)}`
    })

    return encodedName + segments.join('')
  }
}

function encode (string) {
  return encodeURIComponent(string)
    .replace(PARAMETER_SEPARATOR_REGEX, ENCODED_SEPARATOR)
}
