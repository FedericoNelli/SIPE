import LoginInput from "@/components/LoginInput/LoginInput"

function Login() {
    return (
        <section className='flex justify-start items-center min-h-screen w-full'>
            <div className='flex justify-center items-center w-4/6 h-screen bg-sipe-gradient'>
                <img src="./src/assets/images/logo/LogoSIPE.png" alt="Logo" className="w-2/5 mx-auto" />
            </div>
            <div className="flex items-center justfiy-center min-h-screen w-2/6 bg-sipe-blue-dark">
                <LoginInput />
            </div>
        </section>
    )
}

export default Login