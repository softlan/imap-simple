'use strict';
var Imap = require('imap');
const iconv = require('iconv-lite');

/**
 * Given an 'ImapMessage' from the node-imap library,
 * retrieves the message formatted as:
 *
 * {
 *   attributes: object,
 *   parts: [ { which: string, size: number, body: string }, ... ]
 * }
 *
 * @param {object} message an ImapMessage from the node-imap library
 * @returns {Promise} a promise resolving to `message` with schema as described above
 */
module.exports.getMessage = function getMessage(message) {
    return new Promise(function (resolve) {
        var attributes;
        var messageParts = [];
        var isHeader = /^HEADER/g;

        function messageOnBody(stream, info) {
            var body = '';

            function streamOnData(chunk) {
                body += chunk.toString('utf8');
            }

            stream.on('data', streamOnData);

            stream.once('end', function streamOnEnd() {
                stream.removeListener('data', streamOnData);

                var part = {
                    which: info.which,
                    size: info.size,
                    body: body
                };

                if (isHeader.test(part.which)) {
                    part.body = Imap.parseHeader(part.body);
                }

                messageParts.push(part);
            });
        }

        function messageOnAttributes(attrs) {
            attributes = attrs;
        }

        function messageOnEnd() {
            message.removeListener('body', messageOnBody);
            message.removeListener('attributes', messageOnAttributes);
            resolve({
                attributes: attributes,
                parts: messageParts
            });
        }

        message.on('body', messageOnBody);
        message.once('attributes', messageOnAttributes);
        message.once('end', messageOnEnd);
    });
};

module.exports.getMessage2 = function getMessage2(message) {
    return new Promise(function (resolve) {
        var attributes;
        var messageParts = [];
        var isHeader = /^HEADER/g;

        function messageOnBody(stream, info) {
            var body = '';
            var chunks = []; // Îêòàýäð.Ëåáåäåâ

            function streamOnData(chunk) {
                chunks.push(chunk); // Îêòàýäð.Ëåáåäåâ
                body += chunk.toString('utf8');
            }

            stream.on('data', streamOnData);

            stream.once('end', function streamOnEnd() {
                stream.removeListener('data', streamOnData);

                var part = {
                    which: info.which,
                    size: info.size,
                    body: info.which === 'TEXT' || info.which === '1' || info.which === '2' ? Buffer.concat(chunks) : body // Îêòàýäð.Ëåáåäåâ
                };

                if (isHeader.test(part.which)) {
                    part.body = Imap.parseHeader(part.body);
                }

                messageParts.push(part);
            });
        }

        function messageOnAttributes(attrs) {
            attributes = attrs;
        }

        function messageOnEnd() {
            message.removeListener('body', messageOnBody);
            message.removeListener('attributes', messageOnAttributes);
            resolve({
                attributes: attributes,
                parts: messageParts
            });
        }

        message.on('body', messageOnBody);
        message.once('attributes', messageOnAttributes);
        message.once('end', messageOnEnd);
    });
};
