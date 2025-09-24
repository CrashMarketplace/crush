import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Signup() {
    const [step, setStep] = useState<1 | 2 | 3>(1);

    const [id, setId] = useState('');
    const [pw, setPw] = useState('');
    const [pwCheck, setPwCheck] = useState('');

    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');

    const [timeLeft, setTimeLeft] = useState(180);

    useEffect(() => {
        if (step === 3 && timeLeft > 0) {
            const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
            return () => clearInterval(timer);
        }
    }, [step, timeLeft]);

    const formatTime = (sec: number) => {
        const m = Math.floor(sec / 60).toString();
        const s = (sec % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    return(
        <div className="min-h-[calc(100vh-120px)] flex items-center justify-center px-4 py-16">
            <div className="w-full max-w-2xl rounded-[28px] shadow-2xl shadow-black/20 min-h-[50vh]">
                <div className="rounded-[28px] bg-gradient-to-b from-neutral-900 to-neutral-700 text-white">
                    <div className="grid md:grid-cols-2">
                        {/* 왼쪽 영역 */}
                        <div className="relative flex items-center justify-center p-10 md:p-14">
                            <div className="space-y-2 text-center md:text-left">
                                <p className="text-zinc-300 leading-tight text-[18px] md:text-[20px]">
                                    빠르고
                                    <br />
                                    간편한
                                    <br />
                                    중고거래
                                </p>
                                <div className="pt-2 text-4xl md:text-[44px] font-extrabold tracking-tight">
                                    <Link to="/">
                                        KRUSH
                                    </Link>
                                </div>
                            </div>
                            <div className="absolute right-0 hidden w-px md:block top-8 bottom-8 bg-white/30" />
                        </div>
                        {/* 오른쪽 영역 */}
                        <div className="p-8 md:p-12">
                            {step === 1 && (
                                <form 
                                    className="w-full max-w-sm mx-auto space-y-4"
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        setStep(2);
                                    }}
                                >
                                    <input
                                        type="text"
                                        placeholder="아이디"
                                        value={id}
                                        onChange={(e) => setId(e.target.value)}
                                        className="w-full px-3 py-2 text-white border-b border-white bg-white/10 placeholder:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-white"
                                    />
                                    <input
                                        type="password"
                                        placeholder="비밀번호"
                                        value={pw}
                                        onChange={(e) => setPw(e.target.value)}
                                        className="w-full px-3 py-2 text-white border-b border-white bg-white/10 placeholder:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-white"
                                    />
                                    <input
                                        type="password"
                                        placeholder="비밀번호 확인"
                                        value={pwCheck}
                                        onChange={(e) => setPwCheck(e.target.value)}
                                        className="w-full px-3 py-2 text-white border-b border-white bg-white/10 placeholder:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-white"
                                    />
                                    <button
                                        type="submit"
                                        className="w-full py-2 font-semibold bg-white rounded-md text-neutral-900 hover:opacity-90"
                                    >
                                        다음
                                    </button>
                                    <p className="text-xs text-center text-zinc-300">
                                        이미 계정이 있으신가요?{" "}
                                        <Link to="/login" className="underline underline-offset-2">
                                            로그인
                                        </Link>
                                    </p>
                                </form>
                            )}
                            {step === 2 && (
                                <form 
                                    className="w-full max-w-sm mx-auto space-y-4"
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        setStep(3);
                                    }}
                                >
                                    <input
                                        type="email"
                                        placeholder="이메일"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-3 py-2 text-white border rounded-md border-white/25 bg-white/10 placeholder:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-white/40"
                                    />
                                    <input
                                        type="text"
                                        placeholder="인증번호"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        className="w-full px-3 py-2 text-white border rounded-md border-white/25 bg-white/10 placeholder:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-white/40"
                                    />
                                    <button
                                        type="submit"
                                        className="w-full py-2 font-semibold bg-white rounded-md text-neutral-900 hover:opacity-90"
                                    >
                                        회원가입
                                    </button>
                                    <p className="text-xs text-center text-zinc-300">
                                        이미 계정이 있으신가요?{" "}
                                        <Link to="/login" className="underline underline-offset-2">
                                            로그인
                                        </Link>
                                    </p>
                                </form>
                            )}
                            {step === 3 && (
                                <form 
                                    className="w-full max-w-sm mx-auto space-y-4">
                                    <input
                                        type="email"
                                        placeholder="이메일"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-3 py-2 text-white border rounded-md border-white/25 bg-white/10 placeholder:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-white/40"
                                    />
                                    <div className='relative'>
                                        <input
                                            type="text"
                                            placeholder="인증번호"
                                            value={code}
                                            onChange={(e) => setCode(e.target.value)}
                                            className="w-full px-3 py-2 text-white border rounded-md border-white/25 bg-white/10 placeholder:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-white/40"
                                        />
                                        <div className='absolute flex items-center gap-2 text-xs -translate-y-1/2 right-2 top-1/2 text-zinc-300'>
                                            <span>{formatTime(timeLeft)}</span>
                                            <button type="button" className="underline">
                                                확인
                                            </button>
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full py-2 font-semibold bg-white rounded-md text-neutral-900 hover:opacity-90"
                                    >
                                        회원가입
                                    </button>
                                    <p className="text-xs text-center text-zinc-300">
                                        이미 계정이 있으신가요?{" "}
                                        <Link to="/login" className="underline underline-offset-2">
                                            로그인
                                        </Link>
                                    </p>
                                </form>
                            )}
                            
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}