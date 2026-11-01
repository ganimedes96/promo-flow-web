const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const code = ts.transpileModule(fs.readFileSync('src/domains/message-settings/format-message.ts','utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const moduleValue = { exports: {} }; vm.runInNewContext(code, { module: moduleValue, exports: moduleValue.exports, Intl });
const { formatMessage } = moduleValue.exports;
const template = { showImage: true, showHeadline: true, showTitle: true, showDescription: false, showCurrentPrice: true, showOriginalPrice: true, showDiscount: true, showCoupon: true, showLink: true, showFooter: true, headline: 'Chamada da conta', footer: 'Meu rodapé' };
const product = { title: 'Fone Bluetooth', description: 'Descrição oculta', currentPrice: '50', originalPrice: '100', currency: 'BRL', couponCode: 'PROMO', affiliateUrl: 'https://meli.la/meu-link', sourceUrl: 'https://www.mercadolivre.com.br', messageHeadline: 'Frase exclusiva do produto' };
test('preview uses the product phrase and selected fields without inventing discounts', () => {
 const text = formatMessage(product, template);
 assert.ok(text.startsWith('*Frase exclusiva do produto*')); assert.equal(text.includes('Chamada da conta'), false); assert.ok(text.includes('50% de desconto')); assert.ok(text.includes('Cupom: PROMO')); assert.equal(text.includes(product.description), false);
 const clean = formatMessage({ ...product, messageHeadline: null, originalPrice: null, couponCode: null }, { ...template, showCurrentPrice: false, showLink: false, showFooter: false });
 assert.ok(clean.startsWith('*Chamada da conta*')); for (const value of ['Por:', 'desconto', 'Cupom:', 'https://', 'Meu rodapé']) assert.equal(clean.includes(value), false);
});
