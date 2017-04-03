const Duplex = require('stream').Duplex;
const https = require('https');

class BufferedStream extends Duplex {
	constructor(stream, duplexOptions) {
		super(duplexOptions);

		if(typeof stream === 'string') {
			https.get(stream, function (res) { // eslint-disable-line
				res.pipe(this);
			}.bind(this));
		} else {
			stream.pipe(this);
		}

		this.buffer = [];
		this.flushed = true;

		this.on('finish', function () { // eslint-disable-line
			if(this.flushed) this.push(null);
		}.bind(this));
	}

	_read() {
		if(this.flushed) return;

		let doFlush = this.buffer.length;

		while(doFlush) doFlush = this.push(this.buffer.shift()) && this.buffer.length;

		if(this.buffer.length === 0) {
			this.flushed = true;
			if(this._writeableState.ended) this.push(null);
		}
	}

	_write(chunk, encoding, cb) {
		if(this.flushed) this.push(chunk);
		else this.buffer.push(chunk);

		cb();
	}
}

module.exports = BufferedStream;
