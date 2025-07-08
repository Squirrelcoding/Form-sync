const { createServer } = require('http');
const { parse } = require('url');
const { createClient } = require('@supabase/supabase-js');
const next = require('next');
const { Server } = require('socket.io');
require('dotenv').config({ path: ".env.local" })

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// console.log(process.env);
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_ADMIN_KEY)

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(server);

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    let workout_id = "";
    let start_time = 0;

    socket.on('recieve', (arg) => {
      console.log(`RECIEVED ${JSON.stringify(arg)}`);
      workout_id = arg.workout_id;
      start_time = Date.parse(arg.start_time);
    });


    socket.on('disconnect', async () => {
      console.log(`HERE: ${workout_id}`);
      if (workout_id == "") return;
      console.log('User disconnected:', socket.id);
      let result = await supabase
        .from('workouts')
        .update({
          end_time: new Date().toISOString(),
        })
        .eq("workout_id", workout_id);
      console.log(`RESULT: ${result}`);
    });
  });

  server.listen(3000, () => {
    console.log('> Ready on http://localhost:3000');
  });
});
