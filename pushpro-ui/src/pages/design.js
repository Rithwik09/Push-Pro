import Link from 'next/link'
import React, { useState } from 'react'
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { useRouter } from 'next/router';
import { assetPrefix } from '../../next.config';

const Design = () => {
    const [passwordshow1, setpasswordshow1] = useState(false);
    const [passwordshow2, setpasswordshow2] = useState(false);
    const router = useRouter();
    const handleLogin = () => {
        router.push('/login');
    };
    return (
        <>
            <div className="bg-white">
                <div className="main-parent">
                    <div className="grey-sec">             
                    </div>
                    <div className="mb-4 d-xl-none logo-center">
                        <a href="/register/#">
                            <div className=""><img src={`${assetPrefix}/assets/images/brand-logos/desktop-logo.png`} alt="" className="authentication-brand desktop-logo logo-size m-0" /></div>
                        </a>
                    </div>
                    <div className=" row authentication mx-0">
                        <div className="col-xxl-7 col-xl-7 col-lg-12">
                            <div className="row justify-content-center align-items-center h-100 row">
                                <div className="col-12 col-xxl-6 col-xl-9 col-lg-7 col-md-7 col-sm-8">
                                <div className="p-5 same-pad">
                                    <div className="mb-4 d-none d-xl-block">
                                        <a href="/register/#">
                                            <div className=""><img src={`${assetPrefix}/assets/images/brand-logos/dark-logo.png`} alt="" className="authentication-brand desktop-logo logo-size m-0" /></div>
                                            <img src={`${assetPrefix}/assets/images/brand-logos/dark-logo.png`} alt="" className="authentication-brand desktop-dark" />
                                        </a>
                                    </div>
                                    
                                    <p className="h5 fw-semibold mb-2 text-clr-white">Sign Up</p>
                                    <p className="mb-3 text-muted op-7 fw-normal sub-signin">Welcome and Join us by creating a free account !</p>
                                    <div className="row gy-3 mt-4">
                                        <div className=" mb-3 col-xl-12 extra-mar">
                                            <label className="form-label auth-field-color form-label" for="signup-firstname">First Name</label>
                                            <div className="input-group">
                                                <input placeholder="First Name" type="text" id="signup-firstname" className="form-control-lg dark-input auth-input-color form-control" />
                                            </div>
                                        </div>
                                        <div className=" mb-3 col-xl-12 extra-mar">
                                            <label className="form-label auth-field-color form-label" for="signup-lastname">Last Name</label>
                                            <div className="input-group"><input placeholder="Last Name" type="text" id="signup-lastname" className="form-control-lg dark-input auth-input-color form-control" /></div>
                                        </div>
                                        <div className="mb-3 col-xl-12 extra-mar">
                                            <label className="form-label auth-field-color form-label" for="email">Email Address</label>
                                            <div className="input-group"><input placeholder="Email Address" type="text" id="email" className="form-control-lg dark-input auth-input-color form-control" /></div>
                                        </div>
                                        <div className="mb-3 col-xl-12 extra-mar">
                                            <label className="form-label d-block auth-field-color form-label" for="signup-password">Password</label>
                                            <div className="input-group">
                                                <input placeholder="password" type="password" id="signup-password" className="form-control-lg dark-input auth-input-color form-control" />
                                                <button type="button" id="button-addon2" className="btn btn btn-light">
                                                    <i className="ri-eye-off-line align-middle" aria-hidden="true"></i>
                                                </button>   
                                            </div>
                                        </div>
                                        <div className=" mb-3 col-xl-12 extra-mar">
                                            <label className="form-label d-block auth-field-color form-label" for="signup-confirmpassword">Confirm Password</label>
                                            <div className="input-group">
                                                <input placeholder="Confirm Password" type="password" id="signup-confirmpassword" className="form-control-lg dark-input auth-input-color form-control" />
                                                <button type="button" id="button-addon21" className="btn btn btn-light"><i className="ri-eye-off-line align-middle" aria-hidden="true"></i></button></div>
                                            <div className="form-check mt-3"><input className="form-check-input" type="checkbox" id="defaultCheck1" value="" /><label className="form-check-label text-muted fw-normal" for="defaultCheck1">By creating a account you agree to our <a className="text-success" href="/components/pages/terms$conditions/"><u>Terms &amp; Conditions</u></a> and <a className="text-success"><u>Privacy Policy</u></a></label></div>
                                        </div>
                                        <div className="col-xl-12 d-grid mt-2"><button className="btn btn-lg btn-primary btn-style">Create Account</button></div>
                                    </div>
                                    <div className="text-center">
                                        <p className="fs-12 text-muted mt-4">Already have an account? <a className="text-primary" href="/login/">Sign In</a></p>
                                    </div>
                                </div>
                                </div>
                            </div>
                        </div>
                        <div className=" px-0 col-xxl-5 col-xl-5 col-lg-5 mob-logo-center">
                            <div className="authentication-cover">
                                <div className="aunthentication-cover-content rounded">
                                <div className="swiper keyboard-control">
                                    <div className=" text-center black-text p-5 d-flex align-items-center justify-content-center">
                                        <div>
                                            <div className="mb-5"><img className="login-img" src="/assets/images/apps/login-img.png" alt="Login image" /></div>
                                            <h6 className="fw-semibold ">Sign In</h6>
                                            <p className="fw-normal fs-14 op-7 d-xl-block d-none"> Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ipsa eligendi expedita aliquam quaerat nulla voluptas facilis. Porro rem voluptates possimus, ad, autem quae culpa architecto, quam labore blanditiis at ratione.</p>
                                        </div>
                                    </div>
                                </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Design;
