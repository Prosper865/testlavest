import assert from 'node:assert/strict';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';

const client = createClient({ url: 'file::memory:' });
try {
  const db = drizzle(client);
  await migrate(db, { migrationsFolder: './drizzle' });
  const methods = await client.execute('SELECT * FROM payment_methods');
  assert.equal(methods.rows.length, 4);
  assert.ok(methods.rows.every(method => method.address === ''));
  const id = methods.rows[0].id;
  await client.execute({ sql: 'UPDATE payment_methods SET address = ? WHERE id = ?', args: ['test-receiving-address', id] });
  assert.equal((await client.execute({ sql: 'SELECT address FROM payment_methods WHERE id = ?', args: [id] })).rows[0].address, 'test-receiving-address');
  await migrate(db, { migrationsFolder: './drizzle' });
  assert.equal((await client.execute('SELECT * FROM payment_methods')).rows.length, 4);
  assert.equal((await client.execute({ sql: 'SELECT address FROM payment_methods WHERE id = ?', args: [id] })).rows[0].address, 'test-receiving-address');
  await client.execute({ sql: 'UPDATE payment_methods SET address = ? WHERE id = ?', args: ['', id] });
  assert.equal((await client.execute({ sql: 'SELECT address FROM payment_methods WHERE id = ?', args: [id] })).rows[0].address, '');
  console.log('Payment migration passed: defaults, address updates, clearing, and repeat migration.');
} finally {
  client.close();
}
