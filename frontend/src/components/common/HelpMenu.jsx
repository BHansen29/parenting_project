import { useState } from 'react';
import { Info } from 'lucide-react';
import './HelpMenu.css';

export default function HelpMenu({ text }) {

    // If the question doesn't have any help text, don't render the help menu at all.
    if(!text) return null;

    return (
        <div className="help-menu">
            <div className="help-menu__content">
                <Info size={15} />
                <span> <b> Additional Information: </b>    {text}</span>
            </div>
        </div>
    );
}