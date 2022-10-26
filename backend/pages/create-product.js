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
  Switch
} from '@mui/material';
import { PhotoCamera as ImageIcon } from '@mui/icons-material';
import { strings } from '../lang/create-product';
import { strings as commonStrings } from '../lang/common';
import { strings as masterStrings } from '../lang/master';
import * as Helper from '../common/Helper';
import ProductService from '../services/ProductService';
import CategorySelectList from '../components/CategorySelectList';
import { useRouter } from 'next/router';
import Error from '../components/Error';
import Env from '../config/env.config';

import styles from '../styles/create-product.module.css';

export default function CreateProduct({ _user, _signout }) {
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
  const [imageError, setImageError] = useState(false);

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
    Helper.setLanguage(commonStrings);
    Helper.setLanguage(masterStrings);
  }, []);

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
        setImageError(false);
      } catch (err) {
        Helper.error();
      }
    };

    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {

      if (!tempImage) {
        return setImageError(true);
      }

      const _categories = categories.map(c => c._id);
      const _price = parseFloat(price);
      const _quantity = parseInt(quantity);
      const data = {
        name,
        description,
        categories: _categories,
        price: _price,
        quantity: _quantity,
        soldOut,
        hidden,
        image: tempImage
      };

      const res = await ProductService.createProduct(data);

      if (res.status === 200) {
        // Helper.info(strings.PRODUCT_CREATED);

        // setName('');
        // setDescription('');
        // setCategories([]);
        // setPrice('');
        // setQuantity('');
        // setSoldOut(false);
        // setHidden(false);
        // setTempImage('');
        router.replace('/products');
      } else {
        Helper.error();
      }
    }
    catch (err) {
      UserService.signout();
      // Helper.error();
    }
  };

  return (
    !loading && _user &&
    <>
      <Header user={_user} />
      {
        _user.verified &&
        <div className={'content'}>

          <Paper className={styles.form} elevation={10}>
            <form onSubmit={handleSubmit}>

              <div className={styles.image}>
                  <img className={styles.image} alt="" src={tempImage ? Helper.joinURL(Env.CDN_TEMP_PRODUCTS, tempImage) : '/product.png'} />
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
                  <span>{tempImage ? strings.UPDATE_IMAGE : strings.ADD_IMAGE}</span>
                </a>
                <input ref={upload} type="file" accept="image/*" hidden onChange={handleChangeImage} />
              </FormControl>

              <FormControl fullWidth margin="dense">
                <InputLabel className='required'>{strings.NAME}</InputLabel>
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
                <InputLabel className='required'>{strings.DESCRIPTION}</InputLabel>
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
                  label={strings.CATEGORIES}
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
                <InputLabel className='required'>{`${strings.PRICE} (${commonStrings.CURRENCY})`}</InputLabel>
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
                <InputLabel className='required'>{commonStrings.QUANTITY}</InputLabel>
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
                  label={commonStrings.SOLD_OUT}
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
                  label={commonStrings.HIDDEN}
                />
              </FormControl>

              <div className="buttons">
                <Button
                  type="submit"
                  variant="contained"
                  className='btn-primary btn-margin-bottom'
                  size="small"
                >
                  {commonStrings.CREATE}
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

              {imageError && <Error message={strings.IMAGE_ERROR} className={styles.error} />}
            </form>

          </Paper>
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
  let _user = null, _signout = false, _product = null;

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

        if (!_user) {
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
    }
  };
}
