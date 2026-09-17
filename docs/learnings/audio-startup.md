# Audio startup recovery

The reported startup failure combined rejected `decodeAudioData` promises with a missing `forest` cache key. Phaser's callback decoding path left the promise rejection unhandled, and the main menu then attempted to create a sound whose buffer was absent.

The audio loader now owns the decoding promise and retains audio in the preload queue until it completes. Unsupported content receives a silent buffer. Failed downloads are repaired before menu creation. Successfully decoded assets remain unchanged.

Audio-disabled gameplay tests cannot cover this failure. Preserve tests of the normal URL with valid, undecodable and missing audio in Chromium and Firefox. Both menu navigation and entering gameplay must work without page errors; a user gesture must resume the real audio context. CI provides a virtual audio sink for Firefox rather than mocking AudioContext.
