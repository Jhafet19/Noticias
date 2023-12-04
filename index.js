const express=require('express');
const app=express();
const base=require('./conexion')
const bodyParser=require('body-parser');
const jwt=require('jsonwebtoken')
var tokenGenerado;
const claveSecreta='salYPimientaRecienMolida'

app.use(express.static(__dirname));

app.get('/',(req,res)=>{
    res.sendFile(__dirname+('index.html'))
})

app.use(bodyParser.json());

app.get("/noticias", (req, res) => {
  const resultados = "SELECT * FROM noticias";
  base.query(resultados, (err, lista) => {
    if (err) {
      console.log(err);
      res.status(500).send("Error en la base de datos");
    }else{
        let htmlResponse='';
        lista.forEach(noticias => {
            const fecha = new Date(noticias.fechaPublicacion);
            const options = { day: '2-digit', month: '2-digit', year: 'numeric' };

            const fechaFormateada = fecha.toLocaleDateString('es-ES', options);

            htmlResponse+=`   <div class="card">
            <div class="card-header">
                <h5 class="card-title">${noticias.titulo}</h5>

            </div>
            <div class="card-body">
            <p class="card-text">${fechaFormateada}</p>

                <p class="card-text">${noticias.noticia}</p>
                <button type="button" class="btn btn-outline-warning " data-bs-toggle="modal" data-bs-target="#actualizarNoticia" onclick='llenarDatos("${noticias.noticia}","${noticias.titulo}","${noticias.autor}","${fechaFormateada}","${noticias.id}")'>
                    Actualizar
                  </button>
                  <button  type="button" class="btn btn-outline-danger " data-bs-toggle="modal" onclick='eliminarNoticia("${noticias.id}")'>
                    Eliminar
                  </button>
            </div>
        </div>`
        });
        res.send(htmlResponse);
    }

   

  });
});

app.post("/crearNoticia", (req, res) => {
    const datos = req.body;
    const consulta = "INSERT INTO noticias (autor, noticia, fechaPublicacion, titulo) VALUES (?, ?, ?, ?);";
    base.query(
      consulta,
      [datos.autor, datos.noticia, datos.fechaPublicacion, datos.titulo],
      (err, lista) => {
        if (err) {
          console.log(err);
          return res.status(500).send("Error en el server");
        } else {
          res.status(201).json("Nueva noticia creada");
        }
      }
    );
  });

app.put("/actualizarNoticia/:id", (req, res) => {
    const notiId = req.params.id;
    const { noticia,autor,titulo,fechaPublicacion } = req.body;
  
    // Realiza la actualización en la base de datos
    base.query('UPDATE noticias SET noticia = ?, autor = ?, titulo = ?, fechaPublicacion = ? WHERE id = ?', [noticia,autor,titulo,fechaPublicacion,notiId], (err, results) => {
      if (err) {
        console.error('Error al actualizar usuario en la base de datos:', err);
        res.status(500).json({ error: 'Error al actualizar usuario en la base de datos' });
      } else {
        res.json({ message: 'Usuario actualizado exitosamente' });
      }
    });
  });


app.post('/crearCredenciales', (req, res) => {
    const { usuario, contrasena } = req.body;
    console.log(usuario);
    console.log(contrasena);

    // Verificar las credenciales (aquí debes hacer la validación adecuada)
    if (usuario === 'SuperAdmin' && contrasena === 'SUPER') {
        // Generar token JWT
        const token = jwt.sign({ usuario: usuario }, claveSecreta, { expiresIn: '1h' });
        tokenGenerado=token;
        // Enviar el token como respuesta
        res.json({ token });
    } else {
        res.status(401).json({ error: 'Credenciales inválidas' });
    }
});

app.delete('/eliminarHistoria', (req, res) => {
    const datos = req.body;

    if (datos.credencial === tokenGenerado) {
        const sql = `DELETE FROM noticias  WHERE id = ?`;
        const values = [datos.id];
  
   
  
        base.query(sql, values, function(err, results) {
            if (err) {
                console.error(err);
                res.status(500).send("Error al eliminar La noticia");
                return;
            }
            res.status(200).send("Noticia eliminada");
        });
    } else {
        res.status(401).send("Credencial no válida");
    }
  });


app.listen(3000,()=>{
    console.log('Corriendo en el puerto 3000');
})