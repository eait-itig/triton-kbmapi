/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/*
 * Copyright 2019 Joyent, Inc.
 */

/*
 * Test helpers for dealing with tokens
 */

'use strict';

var clone = require('clone');
var common = require('./common');
var doneErr = common.doneErr;
var mod_client = require('./client');
var log = require('./log');

var TYPE = 'pivtoken';

function createToken(t, opts, callback) {
    common.assertArgs(t, opts, callback);
    var client = opts.client || mod_client.get();

    log.debug({ params: opts.params }, 'creating pivtoken');
    opts.fillIn = [ 'guid', 'recovery_tokens' ];
    opts.type = TYPE;
    opts.reqType = 'create';

    var guid = opts.params.guid;
    var params = clone(opts.params);
    delete params.guid;

    if (!opts.desc && opts.expErr) {
        opts.desc = JSON.stringify(opts.params);
    }

    var createOpts = Object.assign({
        guid: guid,
        token: params,
        signer: opts.signer
    }, common.reqOpts(t, opts));

    if (opts.privkey) {
        createOpts.privkey = opts.privkey;
    }

    if (opts.pivyTool) {
        createOpts.pivyTool = opts.pivyTool;
    }

    if (opts.openssl) {
        createOpts.openssl = opts.openssl;
    }

    client.createToken(createOpts,
        common.afterAPIcall.bind(null, t, opts, callback));
}

function createAndGetToken(t, opts, callback) {
    opts.reqType = 'create';
    createToken(t, opts, function (err, res) {
        if (err) {
            doneErr(err, t, callback);
            return;
        }
        opts.reqtype = 'get';

        getToken(t, opts, callback);
    });
}

function getToken(t, opts, callback) {
    common.assertArgs(t, opts, callback);
    var client = opts.client || mod_client.get();
    var guid = opts.params.guid;

    log.debug({ params: opts.params }, 'getting pivtoken');
    opts.type = TYPE;
    opts.reqType = 'get';

    client.getToken(Object.assign({
        guid: guid
    }, common.reqOpts(t, opts)),
        common.afterAPIcall.bind(null, t, opts, callback));
}

function getTokenPin(t, opts, callback) {
    common.assertArgs(t, opts, callback);
    var client = opts.client || mod_client.get();
    var guid = opts.params.guid;

    log.debug({ params: opts.params }, 'getting pivtoken pin');
    opts.type = TYPE;
    opts.reqType = 'get';


    client.getTokenPin(Object.assign({
        guid: guid
    }, common.reqOpts(t, opts)),
        common.afterAPIcall.bind(null, t, opts, callback));
}

function listTokens(t, opts, callback) {
    common.assertArgsList(t, opts, callback);

    var client = opts.client || mod_client.get();
    var params = opts.params || {};
    var desc = ' ' + JSON.stringify(params)
        + (opts.desc ? (' ' + opts.desc) : '');

    if (!opts.desc) {
        opts.desc = desc;
    }
    opts.id = 'token';
    opts.type = TYPE;
    opts.reqType = 'list';

    log.debug({ params: params }, 'list tokens');

    client.listTokens(Object.assign({
        params: params
    }, common.reqOpts(t, opts)),
        common.afterAPIcall.bind(null, t, opts, callback));
}

function deleteToken(t, opts, callback) {
    common.assertArgs(t, opts, callback);
    var client = opts.client || mod_client.get();
    var guid = opts.params.guid;
    var params = clone(opts.params);

    log.debug({ params: opts.params }, 'deleting pivtoken');
    opts.id = guid;
    opts.type = TYPE;
    opts.reqType = 'del';

    delete params.guid;

    client.deleteToken(Object.assign({
        guid: guid,
        token: params
    }, common.reqOpts(t, opts)),
        common.afterAPIdelete.bind(null, t, opts, callback));
}


function getAuth(t, opts, callback) {
    common.assertArgs(t, opts, callback);
    var client = opts.client || mod_client.get();

    log.debug({ params: opts.params }, 'getting auth');
    opts.type = TYPE;
    opts.reqType = 'get';


    client.testAuth(Object.assign({
        token: opts.params.token,
        signer: opts.signer,
        privkey: opts.privkey
    }, common.reqOpts(t, opts)),
        common.afterAPIcall.bind(null, t, opts, callback));
}

module.exports = {
    create: createToken,
    createAndGet: createAndGetToken,
    delete: deleteToken,
    get: getToken,
    getPin: getTokenPin,
    list: listTokens,
    getAuth: getAuth
};
