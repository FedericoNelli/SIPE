import { Link } from "react-router-dom"
import { Button } from "../button/button"

function CardLg() {
    return (
        <>
            <article class="p-10 min-h-116 max-w-3xl w-full bg-sipe-white bg-opacity-10 rounded-xl text-sipe-white xl:col-span-2 transform duration-500 hover:-translate-y-1 cursor-pointer">
                <div className="min-h-62 flex justify-center">
                    <img src="src\assets\images\icons\materialesResumen.png" alt="" />
                </div>
                <h1 class="flex justify-center mt-5 text-5xl font-light text-gray-100 leading-snug  min-h-33">Últimos movimientos
                </h1>
                <div class="flex justify-center text-justify mt-4">
                    <p class="font-light">Lorem ipsum dolor sit, amet consectetur adipisicing elit. Inventore in, hic ipsa, magnam exercitationem provident, necessitatibus delectus dignissimos ipsum veritatis mollitia. Sit, blanditiis qui. A rem velit voluptatum praesentium cumque!
                    Totam numquam molestias minima doloremque suscipit sed cum nihil non in quam eius odio nobis voluptatum modi voluptates at praesentium assumenda eos nam earum, voluptate accusamus! Sunt veritatis eveniet perspiciatis.</p>
                </div>
                <div class="mt-16 flex justify-center ">
                    <Link to="/materiales">
                        <Button variant="sipebutton" size="sipebutton" type="submit">
                            Ir a Materiales
                        </Button>
                    </Link>
                </div>
            </article>
        </>
    )
}

export default CardLg