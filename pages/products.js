import { Box, Button, Container, Dialog, DialogContent, DialogTitle, Grid, Paper, TextField, DialogActions, Card, CardActionArea, CardMedia, CardContent, Typography, CardActions, DialogContentText } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import axios from 'axios'
import Head from 'next/head';
import React, { Component } from 'react'
import {Add} from '@material-ui/icons'
import Image from 'next/image'

export default class Products extends Component {

    state={
        data:[],
        isLoading:true,
        openForm:{open:false, type:''},
        form:{
            nama:'',
            kategori:'',
            // stok:null,
            harga:null,
            gambar:''
        },
        disabled:false
    }

    componentDidMount(){
        this.getdata()
    }

    getdata = () => {
        axios.get('/api/products')
        .then(res=>{
            if(res.data.data)
                this.setState({data:res.data.data, isLoading:false})
        })
    }

    handleChange = ({target}) =>{
        this.setState({form: {...this.state.form, [target.name]: target.value}})
    }

    onUploadImage = async (e) => {
        const formData = new FormData()
        let file = e.target.files[0]
        const fileExt = file.name.split('.').reverse()[0]
        const allowedExt = ['jpg','jpeg','png','gif']
        if(allowedExt.indexOf(fileExt.toLowerCase()) < 0){
            return alert('Allowed upload file for these extentions: jpg, jpeg, png, or gif')
        }else if(file.size > 2 * 1024 * 1024){
            return alert('Maximum file size is 2MB')
        }
        formData.append('image', file)
            const config = {
                headers: { 'content-type': 'multipart/form-data' },
                onUploadProgress: (event) => {
                console.log(`Current progress:`, Math.round((event.loaded * 100) / event.total));
            },
        };
  
      const response = await axios.post('/api/upload', formData, config);
      this.setState({form: {...this.state.form, gambar: response.data.filename}})
    };

    saveData = () =>{
        const {form, openForm} = this.state;
        if(form.nama && form.harga && form.kategori && form.gambar){
            this.setState({disabled:true})
            if(openForm.type === 'Add')
                axios.post('/api/products', {...form, code: Date.now().toString()})
                .then(res=>{
                    this.setState({
                        openForm:{}, 
                        form:{
                            nama:'',
                            kategori:'',
                            // stok:null,
                            harga:null,
                            gambar:''
                        },
                        disabled:false,
                        data:[res.data.data, ...this.state.data]
                    })
                })
            else if(openForm.type === 'Update'){
                const formdata = form
                delete formdata._id
                axios.put(`/api/products/${formdata.code}`, formdata)
                    .then(res=>{
                        const newProductAfterUpdate = this.state.data.map(product => {
                            if (product.code === res.data.data.code) {
                              return res.data.data;
                            }
                            return product;
                          });
                        this.setState({
                            openForm:{}, 
                            form:{
                                nama:'',
                                kategori:'',
                                // stok:null,
                                harga:null,
                                gambar:''
                            },
                            disabled:false,
                            data:newProductAfterUpdate
                        })
                    })
            }
            else if(openForm.type === 'Delete'){
                const formdata = form
                delete formdata._id
                axios.delete(`/api/products/${formdata.code}`)
                    .then(res=>{
                        const newProductAfterDelete = this.state.data.filter(product => product.code !== formdata.code);
                        this.setState({
                            openForm:{}, 
                            form:{
                                nama:'',
                                kategori:'',
                                // stok:null,
                                harga:null,
                                gambar:''
                            },
                            disabled:false,
                            data:newProductAfterDelete
                        })
                    })
            }
        }
    }

    handleClose = () =>{
        this.setState({openForm:{}})

    }
render(){
    const {isLoading, data, openForm, form, disabled} = this.state;
    return (
      <Container style={{paddingTop:20}}>
                <Head>
                    <title>Cashieriiin</title>
                    <link rel="icon" href="/favicon.ico" />
                </Head>
          {/* <input onChange={onChange} type="file" /> */}
          <Grid container spacing={3} justifyContent="space-between">
            <Grid item md={8} xs={12}>
                <div>
                    <div style={{display:'flex', flexDirection:'row', alignItems:'center', justifyContent:'space-between'}}>
                        <h3>Products</h3>
                        <Button onClick={()=>this.setState({openForm:{open:true, type:'Add'}})} variant="contained" color="primary" size="small" startIcon={<Add/>}>Product</Button>
                    </div>

                    <Grid container spacing={2}>
                        {isLoading ?
                        [1,2,3,4].map(e=>(
                            <Grid key={e} item md={6} xs={12}>
                                <Skeleton variant="rect" height={118} />
                                <Box pt={0.5}>
                                    <Skeleton />
                                    <Skeleton width="60%" />
                                </Box>
                            </Grid>
                        ))
                        :
                        data.map(e=>(
                            <Grid key={e.code} item md={6} xs={12}>
                            <Card>
                                <CardActionArea>
                                    <Image
                                        src={`/../public/uploads/${e.gambar}`}
                                        layout='responsive'
                                        height="50"
                                        width="100%"
                                    />
                                    <CardContent>
                                    <Typography gutterBottom variant="h5" component="h2">
                                        {e.nama}
                                    </Typography>
                                    <div style={{display:'flex', justifyContent:'space-between', flexDirection:'row'}}>
                                    <Typography variant="body2" color="textSecondary" component="p">
                                        {e.kategori}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary" component="p">
                                        Rp. {e.harga}
                                    </Typography>
                                    </div>
                                    </CardContent>
                                </CardActionArea>
                                <CardActions style={{justifyContent:'space-between', flexDirection:'row'}}>
                                    <div>
                                        <Button size="small" color="primary">
                                            Add to cart
                                        </Button>
                                        <Button size="small" color="primary" onClick={()=>this.setState({form: e, openForm:{open:true, type:'Update'}})}>
                                            Update
                                        </Button>
                                    </div>
                                    <Button size="small" color="secondary" variant="outlined" onClick={()=>this.setState({form: e, openForm:{open:true, type:'Delete'}})}>
                                        Delete
                                    </Button>
                                </CardActions>
                            </Card>
                            </Grid>
                        ))
                        }
                        <div></div>
                    </Grid>
                </div>
            </Grid>
            <Grid item md={4} xs={12}>
                <Paper style={{padding:'5px 20px', boxShadow:'0px 0px 8px 5px rgba(0,0,0,.1)', borderRadius:10}}>
                    <h3>Cart</h3>
                </Paper>
            </Grid>
          </Grid>
          <style jsx global>{`
            html,
            body {
            padding: 0;
            margin: 0;
            font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
                Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
                sans-serif;
            }
    
            * {
            box-sizing: border-box;
            }
        `}</style>

    <Dialog open={openForm.open} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">{openForm.type} Product</DialogTitle>
        {openForm.type === 'Add' || openForm.type === 'Update' ?
        <DialogContent style={{width:540}}>
          <TextField size="small"
            autoFocus
            margin="dense"
            name="nama"
            label="Product Name"
            type="text"
            value={form.nama}
            onChange={this.handleChange}
            fullWidth
          />
          <TextField size="small"
            margin="dense"
            name="harga"
            label="Product Price"
            type="number"
            value={form.harga}
            onChange={this.handleChange}
            fullWidth
          />
          {/* <TextField size="small"
            margin="dense"
            name="stok"
            label="Product Stock"
            type="number"
            value={form.stok}
            onChange={this.handleChange}
            fullWidth
          /> */}
          <TextField size="small"
            margin="dense"
            name="kategori"
            label="Product Category"
            fullWidth
            select
            value={form.kategori}
            onChange={this.handleChange}
            SelectProps={{
                native: true,
            }}
          >
              <option disabled value=""></option>
              <option value="Food">Food</option>
              <option value="Drink">Drink</option>
        </TextField>
        <TextField onChange={this.onUploadImage} size="small" label="Image" fullWidth type="file" />
        {form.gambar &&
        <Image src={`/../public/uploads/${form.gambar}`} width="100" height="100" />
        }
        </DialogContent>
:
    <DialogContent style={{width:540}}>
        <DialogContentText>
            {form.nama} <br/>
                Are you sure want to delete this product?
        </DialogContentText>
    </DialogContent>
}
        <DialogActions style={{paddingTop:20}}>
          <Button onClick={this.handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={this.saveData} disabled={disabled} color="primary">
            {openForm.type}
          </Button>
        </DialogActions>
      </Dialog>
      </Container>
    );
 }
};