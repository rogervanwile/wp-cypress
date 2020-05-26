<?php

namespace WP_Cypress\Seeder;

use WP_CLI;

class Command {
	const SEEDS_DIR = 'seeds';

	public function __invoke( $args ) {
		if ( ! empty( $args[0] ) ) {
			$this->seed( $args[0] );
			return;
		}

		foreach ( glob( '/' . self::SEEDS_DIR . '/*.php' ) as $filename ) {
			$name = pathinfo( $filename, PATHINFO_FILENAME );
			$this->seed( $name );
		}
	}

	public function seed( string $seed_name ) {
		$seeds_full_path = getcwd() . '/seeds/' . $seed_name . '.php';

		if ( ! file_exists( $seeds_full_path ) ) {
			WP_CLI::error(
				sprintf( 'There is no "%s" class.', $seed_name )
			);
		}

		require_once $seeds_full_path;

		$start_time = microtime( true );
		new $seed_name();
		$run_time = round( microtime( true ) - $start_time, 2 );

		WP_CLI::success( 'Seeded ' . $seed_name . ' in ' . $run_time . ' seconds' );
	}
}
