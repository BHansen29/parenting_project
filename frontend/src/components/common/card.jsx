import * as React from "react";

/**
 * 
 * @param {className} param0 - Additional CSS classes to apply to the card component.
 * 
 * This file defines a set of React components for building a card UI element, including Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent, and CardFooter.
 * Each component accepts a className prop for custom styling and spreads any additional props onto the underlying HTML element.
 * The components use data attributes to identify their role within the card structure, allowing for flexible styling and composition.
 *  
 * @returns  Card components for building a card UI element
 */
function Card({ className, ...props }) {
  return (
    <div
      data-slot="card"
      className={className}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }) {
  return (
    <div
      data-slot="card-header"
      className={className}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }) {
  return (
    <h4
      data-slot="card-title"
      className={className}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }) {
  return (
    <p
      data-slot="card-description"
      className={className}
      {...props}
    />
  );
}

function CardAction({ className, ...props }) {
  return (
    <div
      data-slot="card-action"
      className={className}
      {...props}
    />
  );
}

function CardContent({ className, ...props }) {
  return (
    <div
      data-slot="card-content"
      className={className}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }) {
  return (
    <div
      data-slot="card-footer"
      className={className}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};
