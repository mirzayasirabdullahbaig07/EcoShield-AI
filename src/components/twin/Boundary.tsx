"use client";

import { Component, type ReactNode } from "react";

/** Catches render errors from the 3D canvas so the page can fall back to something that always works. */
export class Boundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onError(); }
  render() { return this.state.failed ? null : this.props.children; }
}
