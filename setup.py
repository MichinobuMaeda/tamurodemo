"""Do setup."""
from setuptools import setup

setup(
    name='tamuro',
    packages=['tamuro'],
    include_package_data=True,
    install_requires=[
        'flask',
        'psycopg2',
        'shortid',
    ],
    setup_requires=[
        'pytest-runner',
    ],
    tests_require=[
        'pytest',
    ],
)
