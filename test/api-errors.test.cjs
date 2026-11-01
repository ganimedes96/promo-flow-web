const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
function load(file, globals = {}) {
 const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
 const module = { exports: {} }; vm.runInNewContext(source, { module, exports: module.exports, Error, ...globals }); return module.exports;
}
const { HandleError } = load('src/api/error.ts');
function client(fetcher) { return load('src/api/client.ts', { fetch: fetcher, require: name => name === './error' ? { HandleError } : { signOut: async () => {} } }); }
test('error messages do not append or duplicate HTTP codes and preserve references', () => {
 const error = new HandleError({ message: 'Tente novamente.', code: 503, requestId: 'test-reference' });
 assert.equal(error.message, 'Tente novamente.'); assert.equal(error.code, 503); assert.equal(error.requestId, 'test-reference');
});
test('fetchClient preserves the API explanation and reference for permission errors', async () => {
 const { fetchClient } = client(async () => new Response(JSON.stringify({ message: 'Acesso exclusivo do administrador.', requestId: 'request-123' }), { status: 403 }));
 await assert.rejects(fetchClient('/operations/status'), error => error.code === 403 && error.requestId === 'request-123' && error.message === 'Acesso exclusivo do administrador.');
});
test('HTML outages become understandable errors rather than JSON syntax errors', async () => {
 const { fetchClient } = client(async () => new Response('<html>PRIVATE INTERNAL OUTPUT</html>', { status: 503 }));
 await assert.rejects(fetchClient('/offers'), error => error.code === 503 && !error.message.includes('PRIVATE') && /temporariamente/.test(error.message));
});
