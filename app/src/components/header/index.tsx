import { FunctionalComponent, h } from "preact";
import { Link } from "preact-router/match";
import * as style from "./style.css";

const Header: FunctionalComponent = () => {
    return (
        <header class={style.header}>
            <h1>Code annotation tool</h1>
            <nav>
                <Link activeClassName={style.active} href="/">
                    Tool
                </Link>
                <Link activeClassName={style.active} href="/about">
                    About
                </Link>
                {/* 
                <Link activeClassName={style.active} href="/profile">
                    Me
                </Link>
                <Link activeClassName={style.active} href="/profile/john">
                    John
                </Link>
                */}
            </nav>
        </header>
    );
};

export default Header;
