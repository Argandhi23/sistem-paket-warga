import prisma from './src/lib/prisma';

async function test() {
  try {
    const u = await prisma.user.create({
      data: {
        name: 'Debug',
        email: 'debug_' + Date.now() + '@example.com',
        role: 'SECURITY',
      }
    });
    console.log('SUCCESS', u);
  } catch (e) {
    console.error('ERROR', e);
  }
}

test();
