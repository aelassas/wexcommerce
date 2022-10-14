import React from 'react';
import { strings as commonStrings } from '../lang/common';
import Link from 'next/link';

export default function Error({ message, style, className }) {

	return (
		<div style={style} className={`${className ? `${className} ` : ''}msg`}>
			<p>{message}</p>
			<Link href='/'><a>{commonStrings.GO_TO_HOME}</a></Link>
		</div>
	);
}
