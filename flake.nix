{
  description = "Ruby environment with rubyzip";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
  };

  outputs = { self, nixpkgs }:
    let
      system = "x86_64-linux";
      pkgs = nixpkgs.legacyPackages.${system};
      ruby_env = pkgs.ruby.withPackages (ps: with ps; [
        rubyzip
      ]);
    in
    {
      devShells.${system}.default = pkgs.mkShell {
        packages = [
          ruby_env
        ];
      };
    };
}