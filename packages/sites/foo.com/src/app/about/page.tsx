'use client';

export default function AboutPage() {
    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">About Us</h1>

            <div className="prose max-w-3xl">
                <p className="mb-4">
                    Welcome to our platform! We are dedicated to providing innovative solutions
                    for managing personal finances and expenditures.
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">Our Mission</h2>
                <p className="mb-4">
                    Our mission is to empower individuals with the tools and insights they
                    need to make informed financial decisions and achieve their financial
                    goals.
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">Our Story</h2>
                <p className="mb-4">
                    Founded in 2024, we started with a simple idea: make personal finance
                    management accessible and intuitive for everyone. Since then, we've grown
                    to serve thousands of users while maintaining our commitment to
                    simplicity and transparency.
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">Contact Us</h2>
                <p className="mb-4">
                    Have questions or feedback? We'd love to hear from you! Reach out to us
                    at:
                </p>
                <ul className="list-disc pl-6 mb-4">
                    <li>Email: contact@example.com</li>
                    <li>Phone: (555) 123-4567</li>
                    <li>Address: 123 Financial District, Business City, BC 12345</li>
                </ul>
            </div>
        </div>
    );
}
