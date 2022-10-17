import { useEffect, useState, useRef } from 'react';
import UserService from '../services/UserService';
import Header from '../components/Header';
import {
  Input,
  InputLabel,
  FormControl,
  FormControlLabel,
  Button,
  Paper,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { PhotoCamera as ImageIcon } from '@mui/icons-material';
import { strings } from '../lang/update-product';
import { strings as cpStrings } from '../lang/create-product';
import { strings as commonStrings } from '../lang/common';
import { strings as masterStrings } from '../lang/master';
import * as Helper from '../common/Helper';
import ProductService from '../services/ProductService';
import NoMatch from '../components/NoMatch';
import CategorySelectList from '../components/CategorySelectList';
import { useRouter } from 'next/router';
import Env from '../config/env.config';

import styles from '../styles/update-product.module.css';

export default function UpdateProduct({ _user, _signout, _noMatch, _product }) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState([]);
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [soldOut, setSoldOut] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [tempImage, setTempImage] = useState('');
  const [openInfoDialog, setOpenInfoDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const upload = useRef(null);

  useEffect(() => {
    if (_user) {
      setLoading(false);
    }
  }, [_user]);

  useEffect(() => {
    if (_signout) {
      UserService.signout();
    }
  }, [_signout]);

  useEffect(() => {
    Helper.setLanguage(strings);
    Helper.setLanguage(cpStrings);
    Helper.setLanguage(commonStrings);
    Helper.setLanguage(masterStrings);
  }, []);

  useEffect(() => {
    if (_product) {
      setName(_product.name);
      setDescription(_product.description);
      setCategories(_product.categories);
      setPrice(_product.price.toString());
      setQuantity(_product.quantity.toString());
      setSoldOut(_product.soldOut);
      setHidden(_product.hidden);
    }
  }, [_product]);

  const handleResend = async (e) => {
    try {
      e.preventDefault();
      const data = { email: _user.email };

      const status = await UserService.resendLink(data);

      if (status === 200) {
        Helper.info(masterStrings.VALIDATION_EMAIL_SENT);
      } else {
        Helper.error(masterStrings.VALIDATION_EMAIL_ERROR);
      }

    } catch (err) {
      Helper.error(masterStrings.VALIDATION_EMAIL_ERROR);
    }
  };

  const handleChangeImage = (e) => {
    const reader = new FileReader();
    const file = e.target.files[0];

    reader.onloadend = async () => {
      try {
        if (tempImage) {
          const status = await ProductService.deleteTempImage(tempImage);

          if (status !== 200) {
            Helper.error();
          }
        }
        const filename = await ProductService.uploadImage(file);
        setTempImage(filename);
      } catch (err) {
        Helper.error();
      }
    };

    reader.readAsDataURL(file);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const _categories = categories.map(c => c._id);
      const _price = parseFloat(price);
      const _quantity = parseInt(quantity);
      const data = {
        _id: _product._id,
        name,
        description,
        categories: _categories,
        price: _price,
        quantity: _quantity,
        soldOut,
        hidden
      };
      if (tempImage) data.image = tempImage;
      const res = await ProductService.updateProduct(data);

      if (res.status === 200) {
        setTempImage('');
        _product.image = res.data.image;
        Helper.info(strings.PRODUCT_UPDATED);
      } else {
        UserService.signout();
        // Helper.error();
      }
    }
    catch (err) {
      Helper.error();
    }
  };

  return (
    !loading && _user &&
    <>
      <Header user={_user} />
      {
        _user.verified &&
        <div className={'content'}>
          {_product &&
            <Paper className={styles.form} elevation={10}>
              <form onSubmit={handleSubmit}>

                <div className={styles.image}
                  style={{ backgroundImage: `url(${Helper.joinURL(tempImage ? Env.CDN_TEMP_PRODUCTS : Env.CDN_PRODUCTS, tempImage || _product.image)})` }}
                >
                </div>

                <FormControl fullWidth margin="dense" className={styles.imageControl}>
                  <a onClick={(e) => {
                    if (upload.current) {
                      upload.current.value = '';

                      setTimeout(() => {
                        upload.current.click(e);
                      }, 0);
                    }
                  }}
                    className={styles.action}
                  >
                    <ImageIcon className={styles.icon} />
                    <span>{cpStrings.UPDATE_IMAGE}</span>
                  </a>
                  <input ref={upload} type="file" accept="image/*" hidden onChange={handleChangeImage} />
                </FormControl>

                <FormControl fullWidth margin="dense">
                  <InputLabel className='required'>{cpStrings.NAME}</InputLabel>
                  <Input
                    type="text"
                    value={name}
                    required
                    onChange={(e) => {
                      setName(e.target.value);
                    }}
                    autoComplete="off"
                  />
                </FormControl>

                <FormControl fullWidth margin="dense">
                  <InputLabel className='required'>{cpStrings.DESCRIPTION}</InputLabel>
                  <Input
                    type="text"
                    value={description}
                    required
                    multiline
                    minRows={3}
                    onChange={(e) => {
                      setDescription(e.target.value);
                    }}
                    autoComplete="off"
                  />
                </FormControl>

                <FormControl fullWidth margin="dense">
                  <CategorySelectList
                    label={cpStrings.CATEGORIES}
                    required
                    multiple
                    variant='standard'
                    selectedOptions={categories}
                    onChange={(values) => {
                      setCategories(values);
                    }}
                  />
                </FormControl>

                <FormControl fullWidth margin="dense">
                  <InputLabel className='required'>{`${cpStrings.PRICE} (${commonStrings.CURRENCY})`}</InputLabel>
                  <Input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => {
                      setPrice(e.target.value);
                    }}
                  />
                </FormControl>

                <FormControl fullWidth margin="dense">
                  <InputLabel className='required'>{cpStrings.QUANTITY}</InputLabel>
                  <Input
                    type="number"
                    inputProps={{ min: 0, step: 1 }}
                    required
                    value={quantity}
                    onChange={(e) => {
                      setQuantity(e.target.value);
                    }}
                  />
                </FormControl>

                <FormControl fullWidth margin="dense">
                  <FormControlLabel
                    control={
                      <Switch checked={soldOut}
                        onChange={(e) => {
                          setSoldOut(e.target.checked);
                        }}
                        color="primary" />
                    }
                    label={cpStrings.SOLD_OUT}
                  />
                </FormControl>

                <FormControl fullWidth margin="dense">
                  <FormControlLabel
                    control={
                      <Switch checked={hidden}
                        onChange={(e) => {
                          setHidden(e.target.checked);
                        }}
                        color="primary" />
                    }
                    label={cpStrings.HIDDEN}
                  />
                </FormControl>

                <div className="buttons">

                  <Button
                    type="submit"
                    variant="contained"
                    className='btn-primary btn-margin-bottom'
                    size="small"
                  >
                    {commonStrings.SAVE}
                  </Button>

                  <Button
                    variant="contained"
                    className='btn-margin-bottom'
                    color='error'
                    size="small"
                    onClick={async () => {
                      try {
                        const status = await ProductService.checkProduct(_product._id);

                        if (status === 204) {
                          setOpenDeleteDialog(true);
                        } else if (status === 200) {
                          setOpenInfoDialog(true);
                        } else {
                          Helper.error();
                        }
                      } catch (err) {
                        UserService.signout();
                        // Helper.error();
                      }
                    }}
                  >
                    {commonStrings.DELETE}
                  </Button>

                  <Button
                    variant="contained"
                    className='btn-secondary btn-margin-bottom'
                    size="small"
                    onClick={async () => {
                      if (tempImage) {
                        const status = await ProductService.deleteTempImage(tempImage);

                        if (status !== 200) {
                          Helper.error();
                        }
                      }

                      router.replace('/products');
                    }}
                  >
                    {commonStrings.CANCEL}
                  </Button>
                </div>
              </form>

              <Dialog
                disableEscapeKeyDown
                maxWidth="xs"
                open={openInfoDialog}
              >
                <DialogTitle className='dialog-header'>{commonStrings.INFO}</DialogTitle>
                <DialogContent>{strings.CANNOT_DELETE_PRODUCT}</DialogContent>
                <DialogActions className='dialog-actions'>
                  <Button onClick={() => setOpenInfoDialog(false)} variant='contained' className='btn-secondary'>{commonStrings.CLOSE}</Button>
                </DialogActions>
              </Dialog>

              <Dialog
                disableEscapeKeyDown
                maxWidth="xs"
                open={openDeleteDialog}
              >
                <DialogTitle className='dialog-header'>{commonStrings.CONFIRM_TITLE}</DialogTitle>
                <DialogContent>{strings.DELETE_PRODUCT}</DialogContent>
                <DialogActions className='dialog-actions'>
                  <Button onClick={() => setOpenDeleteDialog(false)} variant='contained' className='btn-secondary'>{commonStrings.CANCEL}</Button>
                  <Button onClick={async () => {
                    try {
                      const status = await ProductService.deleteProduct(_product._id);

                      if (status === 200) {
                        setOpenDeleteDialog(false);
                        router.replace('/products');
                      } else {
                        Helper.error();
                        setOpenDeleteDialog(false);
                      }
                    } catch (err) {
                      UserService.signout();
                      // Helper.error();
                    }
                  }} variant='contained' color='error'>{commonStrings.DELETE}</Button>
                </DialogActions>
              </Dialog>
            </Paper>
          }

          {_noMatch && <NoMatch />}
        </div>
      }

      {
        !_user.verified &&
        <div className="validate-email">
          <span>{masterStrings.VALIDATE_EMAIL}</span>
          <Button
            type="button"
            variant="contained"
            size="small"
            className="btn-primary btn-resend"
            onClick={handleResend}
          >{masterStrings.RESEND}</Button>
        </div>
      }
    </>
  );
};

export async function getServerSideProps(context) {
  let _user = null, _signout = false, _noMatch = false, _product = null;

  try {
    const currentUser = UserService.getCurrentUser(context);

    if (currentUser) {
      let status;
      try {
        status = await UserService.validateAccessToken(context);
      } catch (err) {
        console.log('Unauthorized!');
      }

      if (status === 200) {
        _user = await UserService.getUser(context, currentUser.id);

        if (_user) {
          const { p: productId } = context.query;
          if (productId) {
            try {
              const lang = UserService.getLanguage(context);
              _product = await ProductService.getProduct(productId, lang);

              if (!_product) {
                _noMatch = true;
              }
            } catch (err) {
              console.log(err);
              _noMatch = true;
            }
          } else {
            _noMatch = true;
          }
        } else {
          _signout = true;
        }
      } else {
        _signout = true;
      }

    } else {
      _signout = true;
    }
  } catch (err) {
    console.log(err);
    _signout = true;
  }

  return {
    props: {
      _user,
      _signout,
      _noMatch,
      _product
    }
  };
}
